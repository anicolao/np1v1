import { logger } from './logger.js';

/**
 * Base error class for the application
 */
export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Discord-specific error
 */
export class DiscordError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(`Discord Error: ${message}`, statusCode);
  }
}

/**
 * Database-specific error
 */
export class DatabaseError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(`Database Error: ${message}`, statusCode);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(`Validation Error: ${message}`, 400);
  }
}

/**
 * Global error handler for uncaught exceptions
 */
export function setupErrorHandlers(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Give time for logging before exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.toString?.() || reason,
      stack: reason?.stack,
    });

    // Give time for logging before exit
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });
}

/**
 * Async error wrapper for promise-based functions
 */
export function asyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Unexpected error in async handler', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw new AppError('An unexpected error occurred');
    }
  };
}

/**
 * Safe JSON parsing with error handling
 */
export function safeJsonParse<T = any>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.warn('Failed to parse JSON', {
      input: jsonString.slice(0, 100),
      error: error instanceof Error ? error.message : String(error),
    });
    return defaultValue;
  }
}