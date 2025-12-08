import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeInfo(): { greeting: string; appStatus: string } {
    return {
      greeting: 'Welcome to the Project Management API',
      appStatus: 'operational',
    };
  }

  getSystemStatus(): { operational: string; checkedAt: string } {
    return {
      operational: 'yes',
      checkedAt: new Date().toISOString(),
    };
  }
}
