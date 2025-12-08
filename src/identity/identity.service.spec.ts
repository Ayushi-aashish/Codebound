import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { AccountService } from '../account/account.service';
import { PermissionLevel } from '../shared/constants/permission-levels.enum';

describe('IdentityService', () => {
  let service: IdentityService;
  let accountService: AccountService;
  let tokenService: JwtService;

  const sampleAccount = {
    accountId: 'acc-uuid-1234',
    emailAddress: 'sample@test.com',
    secretKey: 'encryptedKey123',
    givenName: 'Sample',
    familyName: 'User',
    permissionLevel: PermissionLevel.STANDARD,
    accountActive: true,
    registeredAt: new Date(),
    modifiedAt: new Date(),
  };

  const mockAccountService = {
    retrieveByEmail: jest.fn(),
    registerAccount: jest.fn(),
    retrieveAccountById: jest.fn(),
    verifySecretKey: jest.fn(),
  };

  const mockTokenService = {
    sign: jest.fn().mockReturnValue('generated-auth-token'),
  };

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        { provide: AccountService, useValue: mockAccountService },
        { provide: JwtService, useValue: mockTokenService },
      ],
    }).compile();

    service = testModule.get<IdentityService>(IdentityService);
    accountService = testModule.get<AccountService>(AccountService);
    tokenService = testModule.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processSignUp', () => {
    const signUpData = {
      emailAddress: 'newuser@test.com',
      secretKey: 'secret123',
      givenName: 'New',
      familyName: 'User',
    };

    it('should register a new account successfully', async () => {
      mockAccountService.retrieveByEmail.mockResolvedValue(null);
      mockAccountService.registerAccount.mockResolvedValue({ ...sampleAccount, ...signUpData, accountId: 'new-acc-uuid' });

      const result = await service.processSignUp(signUpData);

      expect(result.outcome).toBe('Registration successful');
      expect(result.authToken).toBe('generated-auth-token');
      expect(result.accountInfo.emailAddress).toBe(signUpData.emailAddress);
    });

    it('should throw ConflictException if account already exists', async () => {
      mockAccountService.retrieveByEmail.mockResolvedValue(sampleAccount);

      await expect(service.processSignUp(signUpData)).rejects.toThrow(ConflictException);
    });
  });

  describe('processSignIn', () => {
    const signInData = {
      emailAddress: 'sample@test.com',
      secretKey: 'secret123',
    };

    it('should authenticate successfully with valid credentials', async () => {
      mockAccountService.retrieveByEmail.mockResolvedValue(sampleAccount);
      mockAccountService.verifySecretKey.mockResolvedValue(true);

      const result = await service.processSignIn(signInData);

      expect(result.outcome).toBe('Authentication successful');
      expect(result.authToken).toBe('generated-auth-token');
      expect(result.accountInfo.emailAddress).toBe(sampleAccount.emailAddress);
    });

    it('should throw UnauthorizedException if account not found', async () => {
      mockAccountService.retrieveByEmail.mockResolvedValue(null);

      await expect(service.processSignIn(signInData)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      mockAccountService.retrieveByEmail.mockResolvedValue({ ...sampleAccount, accountActive: false });

      await expect(service.processSignIn(signInData)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if secret key is invalid', async () => {
      mockAccountService.retrieveByEmail.mockResolvedValue(sampleAccount);
      mockAccountService.verifySecretKey.mockResolvedValue(false);

      await expect(service.processSignIn(signInData)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('retrieveCurrentAccount', () => {
    it('should return account info', async () => {
      mockAccountService.retrieveAccountById.mockResolvedValue(sampleAccount);

      const result = await service.retrieveCurrentAccount('acc-uuid-1234');

      expect(result).toEqual(sampleAccount);
    });
  });
});
