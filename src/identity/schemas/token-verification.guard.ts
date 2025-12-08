import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TokenVerificationGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(error: any, account: any, details: any) {
    if (error || !account) {
      throw error || new UnauthorizedException('Token verification failed');
    }
    return account;
  }
}
