import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  try {
    const logMsg = `\n=========================================\nTIMESTAMP: ${new Date().toISOString()}\nERROR: ${err.message}\nSTACK: ${err.stack}\n=========================================\n`;
    fs.appendFileSync(path.join(process.cwd(), 'error.log'), logMsg);
  } catch (e) {
    console.error('Failed to write to error.log:', e);
  }

  // Handle custom ApiErrors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let statusCode = 400;
    let message = 'Database error occurred';

    if (err.code === 'P2002') {
      statusCode = 409;
      const target = Array.isArray(err.meta?.target) ? err.meta?.target.join(', ') : 'field';
      message = `A record with this ${target} already exists.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Requested record was not found.';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Related record constraint failed.';
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { error: err.message, code: err.code }),
    });
    return;
  }

  // Handle Prisma Validation Errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Invalid data format provided for database operation',
      ...(process.env.NODE_ENV === 'development' && { error: err.message }),
    });
    return;
  }

  console.error('Unhandled Error:', err);

  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    message: isDev && err.message ? err.message : 'Internal server error',
    ...(isDev && {
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
