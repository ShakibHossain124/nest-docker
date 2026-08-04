import { MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import {LoggerMiddleware} from './common/middlewares/logger.middleware'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({isGlobal:true})
    ],
  controllers: [AppController],
  providers: [
    AppService,
    {provide: APP_FILTER, useClass: PrismaExceptionFilter},
    {provide:APP_INTERCEPTOR, useClass: TransformInterceptor}
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*")
  }
}
