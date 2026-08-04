import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login-dto';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService) {}

  @Public()
  @Post("/register")
  register(@Body()registerDto :RegisterDto){
    return this.authService.register(registerDto)
  }

  @Public()
  @Post("/login")
  async login(
    @Body()logInDto:LoginDto,
    @Res({passthrough: true})response: Response
  ){
    const token =  await this.authService.login(logInDto);
    response.cookie('access-token',token,{
      httpOnly:true,
      secure:false,
      sameSite:"lax",
      maxAge: 10 * 60 * 1000
    })

    return {message:"Logged In Successfully"}
  }
}
