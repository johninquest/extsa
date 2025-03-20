import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "./auth.controller";
import { verifyFirebaseToken } from "../../config/firebase";
import { authLimiter } from "./auth.middleware";
import { logRequest, logResponse } from "../../middleware/logging.middleware"; // Adjust the import path as needed

const router = Router();
const controller = new AuthController();

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Apply logging middleware
router.use(logRequest);
router.use(logResponse);

router.post(
  "/confirmation",
  [authLimiter, asyncHandler(verifyFirebaseToken)],
  asyncHandler((req, res, next) => controller.handleSocialAuth(req, res, next))
);

router.get(
  "/session",
  asyncHandler(verifyFirebaseToken),
  asyncHandler((req, res) => controller.handleSessionVerification(req, res))
);

export default router;
