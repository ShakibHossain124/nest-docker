import { ConflictException, Injectable, NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ){}

    async register(registerDto: RegisterDto){
        const existingUser = await this.userService.findByEmail(registerDto.email)
        if(existingUser) throw new ConflictException("Email already registered");


        const saltRounds = Number(this.configService.getOrThrow<number>("BCRYPT_SALT_ROUND"));

        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

        const newUserData = {
            name:registerDto.name,
            email:registerDto.email,
            password:hashedPassword
        }

        const response = await this.userService.create(newUserData)

        return {
            id: response.id,
            name:response.name,
            email:response.email,
            createdAt: response.createdAt,
            updatedAt:response.updatedAt
        }
    }

    async login(loginDto: LoginDto){
        const user = await this.userService.findByEmail(loginDto.email)

        if(!user) throw new NotAcceptableException("Wrong email or pass")

        const userPass = user.password
        const isMatched = await bcrypt.compare(loginDto.password,userPass)

        if(!isMatched) throw new UnauthorizedException("Wrong email or pass")

        const jwt = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            name: user.name
        })
        return jwt;
    }

}
