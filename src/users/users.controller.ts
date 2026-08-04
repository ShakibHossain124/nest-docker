import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCheck } from 'src/common/guards/role-check.guard';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { UserRole } from 'src/generated/prisma/enums';


@UseInterceptors(LoggerInterceptor)
@Roles(UserRole["ADMIN"])
@UseGuards(RoleCheck)
@Controller('/api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Public()
  @Get("/users")
  findAll() {
    return this.usersService.findAll();
  }


  @Post("/user")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }


  @Roles(UserRole["USER"])
  @Get('/user/:id')
  findOne(@Param('id', PositiveIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Roles(UserRole["USER"])
  @Patch("/user/:id")
  update(@Param('id',ParseIntPipe) id: number, @Body()updateUserDto:UpdateUserDto){
    return this.usersService.update(id,updateUserDto);
  }

  @Delete('/user/:id')
  delete(@Param("id",ParseIntPipe)id:number){
    return this.usersService.delete(id)
  }

}
