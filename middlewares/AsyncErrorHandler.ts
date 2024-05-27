import { Request, Response, NextFunction } from 'express';

const AsyncErrorHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  fn(req, res, next).catch(next);
};

export default AsyncErrorHandler;
