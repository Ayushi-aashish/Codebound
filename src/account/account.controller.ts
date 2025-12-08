import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { RegisterAccountSchema } from './schemas/register-account.schema';
import { ModifyAccountSchema } from './schemas/modify-account.schema';
import { TokenVerificationGuard } from '../identity/utilities/token-verification.guard';
import { PermissionGuard } from '../shared/utilities/permission.guard';
import { RequirePermission } from '../shared/utilities/permission-check.decorator';
import { PermissionLevel } from '../shared/constants/permission-levels.enum';

@Controller('accounts')
@UseGuards(TokenVerificationGuard, PermissionGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @RequirePermission(PermissionLevel.ELEVATED)
  registerNew(@Body() registrationData: RegisterAccountSchema) {
    return this.accountService.registerAccount(registrationData);
  }

  @Get()
  @RequirePermission(PermissionLevel.ELEVATED)
  retrieveAll() {
    return this.accountService.retrieveAllAccounts();
  }

  @Get(':id')
  retrieveOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.accountService.retrieveAccountById(id, req.user.accountId, req.user.permissionLevel);
  }

  @Patch(':id')
  modify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() modifications: ModifyAccountSchema,
    @Request() req: any,
  ) {
    return this.accountService.modifyAccount(id, modifications, req.user.accountId, req.user.permissionLevel);
  }

  @Delete(':id')
  @RequirePermission(PermissionLevel.ELEVATED)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountService.removeAccount(id);
  }
}
