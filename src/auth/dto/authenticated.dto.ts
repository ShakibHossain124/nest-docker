// src/common/interfaces/authenticated-request.interface.ts

import { Request } from 'express';
import { UserRole } from 'src/generated/prisma/enums';

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
