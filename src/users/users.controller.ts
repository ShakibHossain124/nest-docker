import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCheck } from 'src/common/guards/role-check.guard';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import { UserRole } from 'src/generated/prisma/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedRequest } from 'src/auth/dto/authenticated.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';



@UseInterceptors(LoggerInterceptor)
@UseGuards(RoleCheck)
@Controller('/api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  

@Public()
@Roles(UserRole["USER"])
  @Get("/users")
  findAll() {
    return this.usersService.findAll();
  }


//user routes
@Roles(UserRole["USER"])
@Patch("/update/self")
updateSelf(
  @CurrentUser()req: AuthenticatedRequest,
  @Body()body: UpdateUserDto
){
 return this.usersService.updateSelf(req.user.sub, body)
}

@Roles(UserRole["USER"])
@Delete("/delete/self")
deleteSelf(
  @CurrentUser('sub')id: number
){
  return this.usersService.deleteSelf(id)
}


//admin routes
  @Roles(UserRole["ADMIN"])
  @Get('/user/:id')
  findOne(@Param('id', PositiveIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Roles(UserRole["ADMIN"])
  @Patch("/user/:id")
  update(@Param('id',ParseIntPipe) id: number, @Body()updateUserDto:UpdateUserDto){
    return this.usersService.update(id,updateUserDto);
  }

 @Roles(UserRole["ADMIN"])
  @Patch("/userRole/:id")
  updateRole(@Param('id',ParseIntPipe) id: number){
    return this.usersService.updateRole(id);
  }

  @Roles(UserRole["ADMIN"])
  @Delete('/user/:id')
  delete(@Param("id",ParseIntPipe)id:number){
    return this.usersService.delete(id)
  }

}
