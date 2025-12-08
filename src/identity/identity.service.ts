import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '../account/account.service';
import { SignInSchema } from './schemas/sign-in.schema';
import { SignUpSchema } from './schemas/sign-up.schema';
import { TokenContents } from './utilities/token.strategy';

@Injectable()
export class IdentityService {
  constructor(
    private accountService: AccountService,
    private tokenService: JwtService,
  ) {}

  async processSignUp(signUpData: SignUpSchema) {
    const existingAccount = await this.accountService.retrieveByEmail(signUpData.emailAddress);

    if (existingAccount) {
      throw new ConflictException('An account with this email already exists');
    }

    const newAccount = await this.accountService.registerAccount({
      emailAddress: signUpData.emailAddress,
      secretKey: signUpData.secretKey,
      givenName: signUpData.givenName,
      familyName: signUpData.familyName,
    });

    const tokenContents: TokenContents = {
      sub: newAccount.accountId,
      emailAddress: newAccount.emailAddress,
      permissionLevel: newAccount.permissionLevel,
    };

    return {
      outcome: 'Registration successful',
      accountInfo: {
        accountId: newAccount.accountId,
        emailAddress: newAccount.emailAddress,
        givenName: newAccount.givenName,
        familyName: newAccount.familyName,
        permissionLevel: newAccount.permissionLevel,
      },
      authToken: this.tokenService.sign(tokenContents),
    };
  }

  async processSignIn(signInData: SignInSchema) {
    const account = await this.accountService.retrieveByEmail(signInData.emailAddress);

    if (!account) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    if (!account.accountActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const keyIsValid = await this.accountService.verifySecretKey(
      signInData.secretKey,
      account.secretKey,
    );

    if (!keyIsValid) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    const tokenContents: TokenContents = {
      sub: account.accountId,
      emailAddress: account.emailAddress,
      permissionLevel: account.permissionLevel,
    };

    return {
      outcome: 'Authentication successful',
      accountInfo: {
        accountId: account.accountId,
        emailAddress: account.emailAddress,
        givenName: account.givenName,
        familyName: account.familyName,
        permissionLevel: account.permissionLevel,
      },
      authToken: this.tokenService.sign(tokenContents),
    };
  }

  async retrieveCurrentAccount(accountId: string) {
    return this.accountService.retrieveAccountById(accountId);
  }
}
