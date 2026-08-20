import { IsEnum } from 'class-validator';
import { UserRole } from 'src/generated/prisma/enums';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
