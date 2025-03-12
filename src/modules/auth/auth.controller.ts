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
    lastLogin?: Date;
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

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: user.provider,
          role: user.role,
          lastLogin: user.lastLogin,
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
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: user.provider,
          role: user.role,
          lastLogin: user.lastLogin,
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
