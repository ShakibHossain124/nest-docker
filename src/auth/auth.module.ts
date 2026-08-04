import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth-guard.service';
import { APP_GUARD } from '@nestjs/core';


@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, {provide:APP_GUARD, useExisting:AuthGuard}],
  imports:[
    UsersModule,
    JwtModule.registerAsync(
      {
        inject:[ConfigService],
        useFactory:(configService:ConfigService)=>(
          {
            secret: configService.getOrThrow<string>("JWT_SECRET"),
            signOptions: {
              expiresIn: configService.getOrThrow("JWT_EXPIRES_IN")
            }
          }
        )
      }
    )
  ],

})
export class AuthModule {}
