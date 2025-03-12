import { Request, Response, NextFunction } from "express";
import Logger from "../config/logger"; // Adjust the import path as needed

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  Logger.info(`Incoming request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
  });
  next();
};

export const logResponse = (req: Request, res: Response, next: NextFunction) => {
  const oldSend = res.send;

  res.send = function (data) {
    Logger.info(`Response: ${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      body: data,
    });
    return oldSend.apply(res, [data]);
  };

  next();
};