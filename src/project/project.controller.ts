import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { NewProjectSchema } from './schemas/new-project.schema';
import { EditProjectSchema } from './schemas/edit-project.schema';
import { TokenVerificationGuard } from '../identity/utilities/token-verification.guard';

@Controller('projects')
@UseGuards(TokenVerificationGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  initiate(@Body() projectData: NewProjectSchema, @Request() req: any) {
    return this.projectService.initiateProject(projectData, req.user.accountId);
  }

  @Get()
  retrieveAll(@Request() req: any) {
    return this.projectService.retrieveAllProjects(req.user.accountId, req.user.permissionLevel);
  }

  @Get(':id')
  retrieveOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.projectService.retrieveProjectById(id, req.user.accountId, req.user.permissionLevel);
  }

  @Patch(':id')
  edit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() edits: EditProjectSchema,
    @Request() req: any,
  ) {
    return this.projectService.editProject(id, edits, req.user.accountId, req.user.permissionLevel);
  }

  @Delete(':id')
  terminate(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.projectService.terminateProject(id, req.user.accountId, req.user.permissionLevel);
  }
}
