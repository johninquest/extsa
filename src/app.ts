// src/app.ts
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes"; // Adjust the import path as needed 
import policyRoutes from "./modules/policy/policy.routes";
import Logger from "./config/logger"; // Adjust the import path as needed
import { handleJsonParsingError, handleError } from "./middleware/error.middleware"; // Adjust the import path as needed

const app: Express = express(); 

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors()); 

// Disable caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Regular middleware
app.use(express.json()); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes); 

// Default route
app.get("/", (req: Request, res: Response) => {
  Logger.info("GET / request received");
  res.status(200).json({ message: "Hello Express/TypeScript API!" });
});

// Important: Error handling middleware registration
// The error handlers must be registered as the last middleware
// For express.json() parsing errors to be caught, we need to register it after express.json()
app.use(handleJsonParsingError);
app.use(handleError);

export default app;