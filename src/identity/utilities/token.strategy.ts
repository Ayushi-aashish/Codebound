import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccountService } from '../../account/account.service';

export interface TokenContents {
  sub: string;
  emailAddress: string;
  permissionLevel: string;
}

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private accountService: AccountService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SESSION_SECRET') || 'default-secret-value',
    });
  }

  async validate(contents: TokenContents) {
    const account = await this.accountService.retrieveAccountById(contents.sub);
    
    if (!account || !account.accountActive) {
      throw new UnauthorizedException('Account not found or deactivated');
    }

    return {
      accountId: contents.sub,
      emailAddress: contents.emailAddress,
      permissionLevel: contents.permissionLevel,
    };
  }
}
