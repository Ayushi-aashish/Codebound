import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project, ProjectProgress, ProjectUrgency } from './models/project.entity';
import { PermissionLevel } from '../shared/constants/permission-levels.enum';

describe('ProjectService', () => {
  let service: ProjectService;
  let repository: Repository<Project>;

  const sampleProject: Partial<Project> = {
    projectId: 'proj-uuid-1234',
    projectName: 'Sample Project',
    projectDetails: 'Sample project details',
    progress: ProjectProgress.NOT_STARTED,
    urgency: ProjectUrgency.NORMAL,
    ownerId: 'acc-uuid-1234',
    initiatedAt: new Date(),
    lastUpdatedAt: new Date(),
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
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = testModule.get<ProjectService>(ProjectService);
    repository = testModule.get<Repository<Project>>(getRepositoryToken(Project));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateProject', () => {
    const projectData = {
      projectName: 'New Project',
      projectDetails: 'New project details',
    };

    it('should create a new project successfully', async () => {
      mockRepo.create.mockReturnValue({ ...projectData, ownerId: 'acc-uuid-1234' });
      mockRepo.save.mockResolvedValue({ ...sampleProject, ...projectData });

      const result = await service.initiateProject(projectData, 'acc-uuid-1234');

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...projectData,
        ownerId: 'acc-uuid-1234',
      });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('retrieveAllProjects', () => {
    it('should return all projects for elevated permission', async () => {
      mockRepo.find.mockResolvedValue([sampleProject]);

      const result = await service.retrieveAllProjects('admin-acc-uuid', PermissionLevel.ELEVATED);

      expect(result).toEqual([sampleProject]);
      expect(mockRepo.find).toHaveBeenCalledWith({
        relations: ['owner'],
        order: { initiatedAt: 'DESC' },
      });
    });

    it('should return only owned projects for standard permission', async () => {
      mockRepo.find.mockResolvedValue([sampleProject]);

      const result = await service.retrieveAllProjects('acc-uuid-1234', PermissionLevel.STANDARD);

      expect(result).toEqual([sampleProject]);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { ownerId: 'acc-uuid-1234' },
        order: { initiatedAt: 'DESC' },
      });
    });
  });

  describe('retrieveProjectById', () => {
    it('should return project for owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);

      const result = await service.retrieveProjectById('proj-uuid-1234', 'acc-uuid-1234', PermissionLevel.STANDARD);

      expect(result).toEqual(sampleProject);
    });

    it('should return project for elevated permission even if not owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);

      const result = await service.retrieveProjectById('proj-uuid-1234', 'admin-acc-uuid', PermissionLevel.ELEVATED);

      expect(result).toEqual(sampleProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.retrieveProjectById('invalid-uuid', 'acc-uuid-1234', PermissionLevel.STANDARD),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if standard user is not owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);

      await expect(
        service.retrieveProjectById('proj-uuid-1234', 'different-acc-uuid', PermissionLevel.STANDARD),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('editProject', () => {
    const edits = { projectName: 'Edited Project' };

    it('should edit project successfully for owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);
      mockRepo.save.mockResolvedValue({ ...sampleProject, ...edits });

      const result = await service.editProject('proj-uuid-1234', edits, 'acc-uuid-1234', PermissionLevel.STANDARD);

      expect(result.projectName).toBe('Edited Project');
    });

    it('should edit project for elevated permission even if not owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);
      mockRepo.save.mockResolvedValue({ ...sampleProject, ...edits });

      const result = await service.editProject('proj-uuid-1234', edits, 'admin-acc-uuid', PermissionLevel.ELEVATED);

      expect(result.projectName).toBe('Edited Project');
    });

    it('should throw NotFoundException if project not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.editProject('invalid-uuid', edits, 'acc-uuid-1234', PermissionLevel.STANDARD),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if standard user is not owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);

      await expect(
        service.editProject('proj-uuid-1234', edits, 'different-acc-uuid', PermissionLevel.STANDARD),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('terminateProject', () => {
    it('should remove project successfully for owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);
      mockRepo.remove.mockResolvedValue(sampleProject);

      const result = await service.terminateProject('proj-uuid-1234', 'acc-uuid-1234', PermissionLevel.STANDARD);

      expect(result.confirmation).toContain('proj-uuid-1234');
    });

    it('should remove project for elevated permission even if not owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);
      mockRepo.remove.mockResolvedValue(sampleProject);

      const result = await service.terminateProject('proj-uuid-1234', 'admin-acc-uuid', PermissionLevel.ELEVATED);

      expect(result.confirmation).toContain('proj-uuid-1234');
    });

    it('should throw NotFoundException if project not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.terminateProject('invalid-uuid', 'acc-uuid-1234', PermissionLevel.STANDARD),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if standard user is not owner', async () => {
      mockRepo.findOne.mockResolvedValue(sampleProject);

      await expect(
        service.terminateProject('proj-uuid-1234', 'different-acc-uuid', PermissionLevel.STANDARD),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
