import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/dto/authenticated.dto';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedRequest['user'], ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!data) {
      return req.user;
    }
    return req.user[data];
  },
);
