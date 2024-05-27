import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/Error.Handler';
import AsyncErrorHandler from './AsyncErrorHandler';
interface JwtPayload {
    UserId: string;
    
  }

export const Authentication = AsyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.SECRET as string) as JwtPayload;

        if (decoded) {
          req.body.UserId = decoded.UserId
          next();
        } else {
          return next(new ErrorHandler(400, 'Invalid token'));
        }
      } catch (error) {
        return next(new ErrorHandler(400, 'Invalid token'));
      }
    } else {
      return next(new ErrorHandler(400, 'Token is required to use this resource'));
    }
  }
);
