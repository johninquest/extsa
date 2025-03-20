import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import Logger from "../config/logger"; // Adjust the import path as needed

// Custom middleware to handle JSON parsing errors
export const handleJsonParsingError: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    Logger.error("Invalid JSON", {
      error: err.message,
      body: req.body,
    });
    res.status(400).json({
      error: "Invalid JSON payload",
    });
    return;
  }
  next(err);
};

// General error-handling middleware
export const handleError: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
  });
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
};