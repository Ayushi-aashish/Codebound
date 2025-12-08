import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { PermissionLevel } from '../../shared/constants/permission-levels.enum';

export class ModifyAccountSchema {
  @IsOptional()
  @IsEmail({}, { message: 'A valid email address is required' })
  emailAddress?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Secret key must contain at least 6 characters' })
  @MaxLength(50, { message: 'Secret key cannot exceed 50 characters' })
  secretKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Given name cannot exceed 50 characters' })
  givenName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Family name cannot exceed 50 characters' })
  familyName?: string;

  @IsOptional()
  @IsEnum(PermissionLevel, { message: 'Permission level must be standard or elevated' })
  permissionLevel?: PermissionLevel;

  @IsOptional()
  @IsBoolean()
  accountActive?: boolean;
}
