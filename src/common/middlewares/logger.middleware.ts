import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('-----------------------------------');
    console.log('Incoming Request');
    console.log(`Method : ${req.method}`);
    console.log(`URL    : ${req.originalUrl}`);
    console.log(`Time   : ${new Date().toISOString()}`);
    console.log('-----------------------------------');

    next();
  }
}
