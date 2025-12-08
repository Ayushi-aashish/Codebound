import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcomeInfo(): { greeting: string; appStatus: string } {
    return this.appService.getWelcomeInfo();
  }

  @Get('status')
  getSystemStatus(): { operational: string; checkedAt: string } {
    return this.appService.getSystemStatus();
  }
}
