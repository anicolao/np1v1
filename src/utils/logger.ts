import fs from 'fs';
import path from 'path';
import { config } from '../config/config.js';

/**
 * Log levels with numeric values for comparison
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Log level mapping from string to enum
 */
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
};

/**
 * Logger class for structured logging
 */
class Logger {
  private readonly logLevel: LogLevel;
  private readonly logDir: string;

  constructor() {
    this.logLevel = LOG_LEVEL_MAP[config.app.logLevel.toLowerCase()] ?? LogLevel.INFO;
    this.logDir = path.resolve(process.cwd(), 'logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  /**
   * Write log to file
   */
  private writeToFile(level: string, formattedMessage: string): void {
    const filename = `${new Date().toISOString().slice(0, 10)}.log`;
    const filepath = path.join(this.logDir, filename);
    
    fs.appendFileSync(filepath, formattedMessage + '\n');
  }

  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (level > this.logLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, data);
    
    // Always write to file
    this.writeToFile(levelName, formattedMessage);
    
    // Console output based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }
  }

  /**
   * Log an error message
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'error', message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'warn', message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'info', message, data);
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'debug', message, data);
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();