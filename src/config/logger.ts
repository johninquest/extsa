// src/config/logger.ts
import winston from "winston";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  // Console transport for development
  new winston.transports.Console(),

  // File transport for errors
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: "logs/system.log",
  }),

  // HTTP request logs
  new winston.transports.File({
    filename: "logs/request.log",
    level: "http",
  }),

  // Debug logs
  new winston.transports.File({
    filename: "logs/debug.log",
    level: "debug",
  }),
];

const Logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels: logLevels,
  format,
  transports,
});

export default Logger;