import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';
export const Public = () => {
  return SetMetadata(PUBLIC_KEY, true);
};
