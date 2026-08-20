import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login-dto';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/generated/prisma/enums';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('/login')
  async login(
    @Body() logInDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(logInDto);
    response.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Logged In Successfully' };
  }

  @Public()
  @Post('/refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { refreshToken, accessToken } = await this.authService.refresh(
      request.cookies['refresh-token'],
    );

    response.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Token refreshed successfully',
    };
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Post('/logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.cookies['refresh-token']);

    response.clearCookie('access-token');
    response.clearCookie('refresh-token');

    return {
      message: 'Logged Out successfully',
    };
  }

  @Roles(UserRole.ADMIN, UserRole.USER)
  @Post('/logout/all')
  async logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logoutAll(request.cookies['refresh-token']);

    response.clearCookie('access-token');
    response.clearCookie('refresh-token');

    return {
      message: 'Logged Out successfully',
    };
  }
}
