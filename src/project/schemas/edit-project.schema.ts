import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ProjectProgress, ProjectUrgency } from '../models/project.entity';

export class EditProjectSchema {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Project name cannot exceed 200 characters' })
  projectName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Project details cannot exceed 2000 characters' })
  projectDetails?: string;

  @IsOptional()
  @IsEnum(ProjectProgress, { message: 'Progress must be not_started, working, or finished' })
  progress?: ProjectProgress;

  @IsOptional()
  @IsEnum(ProjectUrgency, { message: 'Urgency must be minimal, normal, or critical' })
  urgency?: ProjectUrgency;

  @IsOptional()
  @IsDateString({}, { message: 'Target date must be a valid date format' })
  targetDate?: string;
}
