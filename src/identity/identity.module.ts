import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { TokenStrategy } from './utilities/token.strategy';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    AccountModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('SESSION_SECRET') || 'default-secret-value',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [IdentityController],
  providers: [IdentityService, TokenStrategy],
  exports: [IdentityService, JwtModule],
})
export class IdentityModule {}
