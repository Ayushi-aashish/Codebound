import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IdentityService } from './identity.service';
import { SignInSchema } from './schemas/sign-in.schema';
import { SignUpSchema } from './schemas/sign-up.schema';
import { TokenVerificationGuard } from './utilities/token-verification.guard';

@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('sign-up')
  signUp(@Body() signUpData: SignUpSchema) {
    return this.identityService.processSignUp(signUpData);
  }

  @Post('sign-in')
  signIn(@Body() signInData: SignInSchema) {
    return this.identityService.processSignIn(signInData);
  }

  @Get('current')
  @UseGuards(TokenVerificationGuard)
  getCurrentAccount(@Request() req: any) {
    return this.identityService.retrieveCurrentAccount(req.user.accountId);
  }
}
