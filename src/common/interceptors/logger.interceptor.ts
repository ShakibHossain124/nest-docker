import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<Request>();

    console.log('Preinterceptor: ');
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log(`${req.originalUrl} Execution time is ${duration}ms`);
        console.log('Post Interceptor:');
      }),
    );
  }
}
