import { IsNotEmpty, IsEmail, MinLength, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;
}
