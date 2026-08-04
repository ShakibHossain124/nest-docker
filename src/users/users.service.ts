import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
    
    return this.prisma.user.update({
      where:{id:id},
      data:updateUserDto
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
