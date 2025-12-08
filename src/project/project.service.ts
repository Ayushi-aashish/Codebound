import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './models/project.entity';
import { NewProjectSchema } from './schemas/new-project.schema';
import { EditProjectSchema } from './schemas/edit-project.schema';
import { PermissionLevel } from '../shared/constants/permission-levels.enum';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async initiateProject(projectData: NewProjectSchema, ownerId: string): Promise<Project> {
    const newProject = this.projectRepository.create({
      ...projectData,
      ownerId,
    });

    return this.projectRepository.save(newProject);
  }

  async retrieveAllProjects(accountId: string, permissionLevel: PermissionLevel): Promise<Project[]> {
    if (permissionLevel === PermissionLevel.ELEVATED) {
      return this.projectRepository.find({
        relations: ['owner'],
        order: { initiatedAt: 'DESC' },
      });
    }

    return this.projectRepository.find({
      where: { ownerId: accountId },
      order: { initiatedAt: 'DESC' },
    });
  }

  async retrieveProjectById(
    projectId: string,
    accountId: string,
    permissionLevel: PermissionLevel,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { projectId },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException(`Project not found: ${projectId}`);
    }

    if (permissionLevel !== PermissionLevel.ELEVATED && project.ownerId !== accountId) {
      throw new ForbiddenException('Access denied to this project');
    }

    return project;
  }

  async editProject(
    projectId: string,
    edits: EditProjectSchema,
    accountId: string,
    permissionLevel: PermissionLevel,
  ): Promise<Project> {
    const targetProject = await this.projectRepository.findOne({ where: { projectId } });

    if (!targetProject) {
      throw new NotFoundException(`Project not found: ${projectId}`);
    }

    if (permissionLevel !== PermissionLevel.ELEVATED && targetProject.ownerId !== accountId) {
      throw new ForbiddenException('Access denied to modify this project');
    }

    Object.assign(targetProject, edits);
    return this.projectRepository.save(targetProject);
  }

  async terminateProject(
    projectId: string,
    accountId: string,
    permissionLevel: PermissionLevel,
  ): Promise<{ confirmation: string }> {
    const targetProject = await this.projectRepository.findOne({ where: { projectId } });

    if (!targetProject) {
      throw new NotFoundException(`Project not found: ${projectId}`);
    }

    if (permissionLevel !== PermissionLevel.ELEVATED && targetProject.ownerId !== accountId) {
      throw new ForbiddenException('Access denied to remove this project');
    }

    await this.projectRepository.remove(targetProject);
    return { confirmation: `Project ${projectId} has been terminated` };
  }
}
