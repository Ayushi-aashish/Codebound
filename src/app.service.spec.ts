import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = testModule.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWelcomeInfo', () => {
    it('should return greeting and app status', () => {
      const result = service.getWelcomeInfo();
      expect(result).toEqual({
        greeting: 'Welcome to the Project Management API',
        appStatus: 'operational',
      });
    });
  });

  describe('getSystemStatus', () => {
    it('should return operational status with timestamp', () => {
      const result = service.getSystemStatus();
      expect(result.operational).toBe('yes');
      expect(result.checkedAt).toBeDefined();
      expect(typeof result.checkedAt).toBe('string');
    });
  });
});
