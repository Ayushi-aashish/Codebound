import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PermissionLevel } from '../../shared/constants/permission-levels.enum';

export class RegisterAccountSchema {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  emailAddress: string;

  @IsString()
  @IsNotEmpty({ message: 'Secret key is required' })
  @MinLength(6, { message: 'Secret key must contain at least 6 characters' })
  @MaxLength(50, { message: 'Secret key cannot exceed 50 characters' })
  secretKey: string;

  @IsString()
  @IsNotEmpty({ message: 'Given name is required' })
  @MaxLength(50, { message: 'Given name cannot exceed 50 characters' })
  givenName: string;

  @IsString()
  @IsNotEmpty({ message: 'Family name is required' })
  @MaxLength(50, { message: 'Family name cannot exceed 50 characters' })
  familyName: string;

  @IsOptional()
  @IsEnum(PermissionLevel, { message: 'Permission level must be standard or elevated' })
  permissionLevel?: PermissionLevel;
}
