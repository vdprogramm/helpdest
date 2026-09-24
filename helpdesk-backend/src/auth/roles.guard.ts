import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            'roles',
            [
                context.getHandler(),
                context.getClass(),
            ],
        );

        // API không yêu cầu role cụ thể
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context
            .switchToHttp()
            .getRequest();

        const user = request.user;

        if (!user) {
            throw new ForbiddenException(
                'Không xác định được người dùng',
            );
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                'Bạn không có quyền truy cập tài nguyên này',
            );
        }

        return true;
    }
}