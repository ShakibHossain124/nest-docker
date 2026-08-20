import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  //user methods

  async updateSelf(id: number, body: UpdateUserDto) {
    if (body.password) {
      const password = body.password;
      const saltRounds = Number(
        this.configService.getOrThrow<number>('BCRYPT_SALT_ROUND'),
      );
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      body.password = hashedPassword;
    }

    return this.prisma.user.update({
      where: { id },
      data: body,
    });
  }

  async deleteSelf(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  //admin methods
  async findAll(query: GetUsersQueryDto) {
    const { limit, page, order = 'asc', sortBy = 'id', role, search } = query;

    let where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];

    if ((page && !limit) || (!page && limit)) {
      throw new BadRequestException('page and limit must be provided together');
    }

    if (limit && page) {
      const skip = (page - 1) * limit;
      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          skip: skip,
          take: limit,
          orderBy: [
            {
              [sortBy]: order,
            },
            {
              id: 'asc',
            },
          ],
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    return await this.prisma.user.findMany({
      where,
      orderBy: [
        {
          [sortBy]: order,
        },
        {
          id: 'asc',
        },
      ],
      select:{
        id:true,
        name: true,
        email: true,
        password: true,
        createdAt:true,
        updatedAt: true,
        _count:true,
        refreshTokens:{
          select:{
            hashedToken:true
          }
        },
      }
    });
  }

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findOne(id: number) {
    let user = await this.prisma.user.findUnique({
      where: { id },
      select:{
        id:true,
        name:true,
        email: true,
        role:true,
        createdAt:true,
        updatedAt:true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    if (updateUserDto.password) {
      const password = updateUserDto.password;
      const saltRounds = Number(
        this.configService.getOrThrow<number>('BCRYPT_SALT_ROUND'),
      );
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateUserDto.password = hashedPassword;
    }

    return this.prisma.user.update({
      where: { id: id },
      data: updateUserDto,
    });
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    });
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id: id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
