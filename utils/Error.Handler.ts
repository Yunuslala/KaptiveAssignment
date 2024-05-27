// utils/Error.Handler.ts
import { Request, Response, NextFunction } from 'express';

export class ErrorHandler extends Error {
    statusCode: number;
    
    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Middleware for handling errors
  export const handleError = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    const { statusCode, message } = err;
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message
    });
  };
  