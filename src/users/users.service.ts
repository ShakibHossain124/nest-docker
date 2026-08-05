import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import bcrypt from "bcrypt";


@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

//user methods

async updateSelf(id:number, body:UpdateUserDto){

  if(body.password){
      const password = body.password
      const saltRounds = Number(this.configService.getOrThrow<number>("BCRYPT_SALT_ROUND"));
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      body.password = hashedPassword
    }
  
  return this.prisma.user.update({
    where:{id},
    data:body
  })

}

async deleteSelf(id:number){
  return this.prisma.user.delete({where:{id}})
}
  
//admin methods
  async findAll() {
    return await this.prisma.user.findMany();
  }

  async create(createUserDto: CreateUserDto) {
      return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findOne(id: number) {
    let user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id:number, updateUserDto: UpdateUserDto){
    await this.findOne(id);
    if(updateUserDto.password){
      const password = updateUserDto.password
      const saltRounds = Number(this.configService.getOrThrow<number>("BCRYPT_SALT_ROUND"));
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateUserDto.password = hashedPassword
    }
    
    return this.prisma.user.update({
      where:{id:id},
      data:updateUserDto
    })

  } 

  async updateRole(id:number){
    return this.prisma.user.update({
      where:{id},
      data:{role:"ADMIN"}
    })
  }

  async delete(id:number){
    await this.findOne(id)
    return this.prisma.user.delete({where:{id:id}})
  }

  async findByEmail(email: string){
    return this.prisma.user.findUnique({
      where:{email}
    })
  }

}
