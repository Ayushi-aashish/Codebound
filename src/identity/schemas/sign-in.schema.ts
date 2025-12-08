import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInSchema {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  emailAddress: string;

  @IsString()
  @IsNotEmpty({ message: 'Secret key is required' })
  @MinLength(6, { message: 'Secret key must contain at least 6 characters' })
  secretKey: string;
}
