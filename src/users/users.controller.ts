import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCheck } from 'src/common/guards/role-check.guard';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { UserRole } from 'src/generated/prisma/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from 'jsonwebtoken';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@UseInterceptors(LoggerInterceptor)
@UseGuards(RoleCheck)
@Controller('/api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Get('/users')
  findAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  //user routes
  @Roles(UserRole['USER'])
  @Patch('/update/self')
  updateSelf(@CurrentUser() req: JwtPayload, @Body() body: UpdateUserDto) {
    return this.usersService.updateSelf(req.user.sub, body);
  }

  @Roles(UserRole['USER'])
  @Delete('/delete/self')
  deleteSelf(@CurrentUser('sub') id: number) {
    return this.usersService.deleteSelf(id);
  }

  //admin routes
  @Roles(UserRole['ADMIN'])
  @Get('/user/:id')
  findOne(@Param('id', PositiveIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Roles(UserRole['ADMIN'])
  @Patch('/user/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(UserRole['ADMIN'])
  @Patch('/userRole/:id')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() role: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, role);
  }

  @Roles(UserRole['ADMIN'])
  @Delete('/user/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}
