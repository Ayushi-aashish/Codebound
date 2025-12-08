import { SetMetadata } from '@nestjs/common';
import { PermissionLevel } from '../constants/permission-levels.enum';

export const PERMISSION_METADATA_KEY = 'requiredPermissions';
export const RequirePermission = (...levels: PermissionLevel[]) => 
  SetMetadata(PERMISSION_METADATA_KEY, levels);