import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionLevel } from '../constants/permission-levels.enum';
import { PERMISSION_METADATA_KEY } from './permission-check.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevels = this.reflector.getAllAndOverride<PermissionLevel[]>(
      PERMISSION_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredLevels) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredLevels.some((level) => user.permissionLevel === level);
  }
}
