import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RoleCheck implements CanActivate{
    constructor(private readonly reflector: Reflector){}
    canActivate(context: ExecutionContext): boolean{
        const roles = this.reflector.getAllAndOverride(
            ROLES_KEY,
            [
                context.getHandler(),
                context.getClass()
            ]
        )

        const request = context.switchToHttp().getRequest()

        const reqRole = request.headers.role

        if(!roles) return true;
        if(roles.includes(reqRole)) return true;

        throw new ForbiddenException("Roles does not match")

    }
}