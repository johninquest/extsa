import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import Logger from "../../config/logger";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    provider?: string;
    role: string;
    lastLogin?: Date | null;
  };
}

export class AuthController {
  private authService = new AuthService();

  async handleSocialAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User is not authenticated");
      }

      const user = await this.authService.findOrCreateUser({
        uid: req.user.uid,
        email: req.user.email || "",
        displayName: req.user.displayName,
        photoURL: req.user.photoURL,
        provider: req.user.provider,
      });

      // Make sure user is not null before accessing properties
      if (!user) {
        throw new Error("Failed to create or retrieve user");
      }

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          provider: user.provider || undefined,
          role: user.role,
          lastLogin: user.lastLogin || null,
        },
      };

      res.json(response);
    } catch (error) {
      Logger.error("Social authentication failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        uid: req.user?.uid,
      });
      next(error);
    }
  }

  async handleSessionVerification(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User is not authenticated");
      }
      const user = await this.authService.getUserById(req.user.id);

      if (!user) {
        res.status(401).json({ authenticated: false });
        return;
      }

      res.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          provider: user.provider || null,
          role: user.role,
          lastLogin: user.lastLogin || null,
        },
      });
    } catch (error) {
      Logger.error("Session verification failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        uid: req.user?.uid,
      });
      res.status(401).json({ authenticated: false });
    }
  }
}