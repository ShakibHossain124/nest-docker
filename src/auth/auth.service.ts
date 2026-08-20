import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login-dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from 'src/generated/prisma/client';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  private generateAccessToken(user: {id:number,email:string,name:string,role:UserRole}) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: 'access',
    });
  }

  private generateRefreshToken(userId: number) {
    return this.jwtService.sign(
      {
        sub: userId,
        type: 'refresh',
      },
      {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      },
    );
  }

  async refresh(token: string) {
    const refreshSecret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
    let payload;
    try {
      payload = this.jwtService.verify(token, { secret: refreshSecret });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const userId = payload.sub;
    const type = payload.type;
    const validTokenId = await this.refreshTokenService.validateToken(
      userId,
      token,
    );
    if (!validTokenId)
      throw new UnauthorizedException('not a matched refresh token');
    if (type !== 'refresh')
      throw new UnauthorizedException('not a matched refresh token role');
    const user = await this.userService.findOne(userId);
    const newRefreshToken = this.generateRefreshToken(user.id);
    const newAccessToken = this.generateAccessToken(user);

    await this.refreshTokenService.rotate(
      validTokenId,
      userId,
      newRefreshToken,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already registered');

    const saltRounds = Number(
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUND'),
    );

    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const newUserData = {
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
    };

    const response = await this.userService.create(newUserData);

    return {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) throw new NotAcceptableException('Wrong email or pass');

    const userPass = user.password;
    const isMatched = await bcrypt.compare(loginDto.password, userPass);

    if (!isMatched) throw new UnauthorizedException('Wrong email or pass');

    const accessToken = this.generateAccessToken(user);

    const refreshToken = this.generateRefreshToken(user.id);

    await this.refreshTokenService.storeToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    const refreshSecret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
      const userId = payload.sub;
      const type = payload.type;
      const validTokenId = await this.refreshTokenService.validateToken(
        userId,
        refreshToken,
      );
      if (!validTokenId)
        throw new UnauthorizedException('not a matched refresh token');
      if (type !== 'refresh')
        throw new UnauthorizedException('not a matched refresh token role');
      await this.refreshTokenService.deleteRefreshToken(validTokenId);
    } catch (error) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }

  async logoutAll(refreshToken: string) {
    const refreshSecret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
      const userId = payload.sub;
      const type = payload.type;
      const validTokenId = await this.refreshTokenService.validateToken(
        userId,
        refreshToken,
      );
      if (!validTokenId)
        throw new UnauthorizedException('not a matched refresh token');
      if (type !== 'refresh')
        throw new UnauthorizedException('not a matched refresh token role');
      await this.refreshTokenService.deleteRefreshTokenOfUser(userId);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
