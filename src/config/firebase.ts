import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";
import { Request, Response, NextFunction } from "express"; 
import Logger from "./logger";
import "dotenv/config";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: FirebaseUser;
    }
  }
}

// Type for decoded Firebase token
interface FirebaseUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: any;
}

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (admin.apps.length > 0) return admin.app();

  try {
    const serviceAccount = JSON.parse(
      readFileSync(join(__dirname, "firebase-service-account.json"), "utf8")
    );

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (error) {
    Logger.error("Firebase initialization failed", error);
    process.exit(1);
  }
};

// Authentication middleware
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const idToken = authHeader?.split("Bearer ")[1];

  if (!idToken) {
    Logger.warn("Authentication attempt without token", {
      endpoint: req.originalUrl,
      ip: req.ip
    });
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    const projectId = process.env.FIREBASE_PROJECT_ID;

    // Security validation
    if (
      decodedToken.aud !== projectId ||
      decodedToken.iss !== `https://securetoken.google.com/${projectId}`
    ) {
      Logger.warn("Invalid token issuer/audience", {
        token: idToken.slice(0, 8) + '...',
        aud: decodedToken.aud,
        iss: decodedToken.iss
      });
      return res.status(403).json({ error: "Invalid authentication source" });
    }

    // Attach normalized user data
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      provider: decodedToken.firebase.sign_in_provider
    };

    next();
  } catch (error) {
    Logger.error("Token verification failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      token: idToken.slice(0, 8) + '...'
    });
    res.status(401).json({ error: "Invalid or expired credentials" });
  }
};

// Initialize on first import
export const firebase = initializeFirebase();