import { IsNotEmpty, IsEmail, MinLength, IsString } from "class-validator";

export class RegisterDto{
    
    @IsString()
    @IsNotEmpty()
        name!:string;

    @IsNotEmpty()
    @IsEmail()
        email!:string;
        
    @MinLength(8)
    password!:string;
}