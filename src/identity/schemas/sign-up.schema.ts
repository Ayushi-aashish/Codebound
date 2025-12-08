import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class SignUpSchema {
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
}
