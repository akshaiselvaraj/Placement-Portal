import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import fs from 'fs';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  try {
    const logMsg = `\n=========================================\nTIMESTAMP: ${new Date().toISOString()}\nERROR: ${err.message}\nSTACK: ${err.stack}\n=========================================\n`;
    fs.appendFileSync('c:/project/softwarehack/Placement-Portal/backend/error.log', logMsg);
  } catch (e) {
    console.error('Failed to write to error.log:', e);
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  console.error('Unhandled Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};
