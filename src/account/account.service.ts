import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AccountService } from './account.service';
import { Account } from './models/account.entity';
import { PermissionLevel } from '../shared/constants/permission-levels.enum';

jest.mock('bcrypt');

describe('AccountService', () => {
  let service: AccountService;
  let repository: Repository<Account>;

  const sampleAccount: Partial<Account> = {
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

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = testModule.get<AccountService>(AccountService);
    repository = testModule.get<Repository<Account>>(getRepositoryToken(Account));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerAccount', () => {
    const registrationData = {
      emailAddress: 'newuser@test.com',
      secretKey: 'secret123',
      givenName: 'New',
      familyName: 'User',
    };

    it('should register a new account successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ ...registrationData, accountId: 'new-acc-uuid' });
      mockRepo.save.mockResolvedValue({ ...sampleAccount, ...registrationData, accountId: 'new-acc-uuid' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('encryptedKey123');

      const result = await service.registerAccount(registrationData);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { emailAddress: registrationData.emailAddress },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registrationData.secretKey, 10);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if account exists', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      await expect(service.registerAccount(registrationData)).rejects.toThrow(ConflictException);
    });
  });

  describe('retrieveAllAccounts', () => {
    it('should return array of accounts', async () => {
      mockRepo.find.mockResolvedValue([sampleAccount]);

      const result = await service.retrieveAllAccounts();

      expect(result).toEqual([sampleAccount]);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('retrieveAccountById', () => {
    it('should return account for owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      const result = await service.retrieveAccountById('acc-uuid-1234', 'acc-uuid-1234', PermissionLevel.STANDARD);

      expect(result).toEqual(sampleAccount);
    });

    it('should return account for elevated permission', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      const result = await service.retrieveAccountById('acc-uuid-1234', 'other-acc-uuid', PermissionLevel.ELEVATED);

      expect(result).toEqual(sampleAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.retrieveAccountById('invalid-uuid', 'acc-uuid-1234', PermissionLevel.STANDARD)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if standard user tries to view another account', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      await expect(service.retrieveAccountById('acc-uuid-1234', 'different-acc-uuid', PermissionLevel.STANDARD)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('retrieveByEmail', () => {
    it('should return account by email', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      const result = await service.retrieveByEmail('sample@test.com');

      expect(result).toEqual(sampleAccount);
    });

    it('should return null if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.retrieveByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('modifyAccount', () => {
    const modifications = { givenName: 'Modified' };

    it('should modify own account successfully', async () => {
      mockRepo.findOne.mockResolvedValueOnce(sampleAccount);
      mockRepo.save.mockResolvedValue({ ...sampleAccount, ...modifications });
      mockRepo.findOne.mockResolvedValueOnce({ ...sampleAccount, ...modifications });

      const result = await service.modifyAccount('acc-uuid-1234', modifications, 'acc-uuid-1234', PermissionLevel.STANDARD);

      expect(result.givenName).toBe('Modified');
    });

    it('should modify any account for elevated permission', async () => {
      mockRepo.findOne.mockResolvedValueOnce(sampleAccount);
      mockRepo.save.mockResolvedValue({ ...sampleAccount, ...modifications });
      mockRepo.findOne.mockResolvedValueOnce({ ...sampleAccount, ...modifications });

      const result = await service.modifyAccount('acc-uuid-1234', modifications, 'admin-acc-uuid', PermissionLevel.ELEVATED);

      expect(result.givenName).toBe('Modified');
    });

    it('should throw NotFoundException if account not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.modifyAccount('invalid-uuid', modifications, 'acc-uuid-1234', PermissionLevel.STANDARD)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if standard user tries to modify another account', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      await expect(service.modifyAccount('acc-uuid-1234', modifications, 'different-acc-uuid', PermissionLevel.STANDARD)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if standard user tries to change permission level', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      await expect(service.modifyAccount('acc-uuid-1234', { permissionLevel: PermissionLevel.ELEVATED }, 'acc-uuid-1234', PermissionLevel.STANDARD)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if standard user tries to change account status', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);

      await expect(service.modifyAccount('acc-uuid-1234', { accountActive: false }, 'acc-uuid-1234', PermissionLevel.STANDARD)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeAccount', () => {
    it('should remove account successfully', async () => {
      mockRepo.findOne.mockResolvedValue(sampleAccount);
      mockRepo.remove.mockResolvedValue(sampleAccount);

      const result = await service.removeAccount('acc-uuid-1234');

      expect(result.confirmation).toContain('acc-uuid-1234');
    });

    it('should throw NotFoundException if account not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.removeAccount('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifySecretKey', () => {
    it('should return true for valid key', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifySecretKey('secret', 'encryptedKey');

      expect(result).toBe(true);
    });

    it('should return false for invalid key', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifySecretKey('wrongsecret', 'encryptedKey');

      expect(result).toBe(false);
    });
  });
});
