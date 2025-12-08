import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../account/models/account.entity';

export enum ProjectProgress {
  NOT_STARTED = 'not_started',
  WORKING = 'working',
  FINISHED = 'finished',
}

export enum ProjectUrgency {
  MINIMAL = 'minimal',
  NORMAL = 'normal',
  CRITICAL = 'critical',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  projectId: string;

  @Column()
  projectName: string;

  @Column({ type: 'text', nullable: true })
  projectDetails: string;

  @Column({
    type: 'enum',
    enum: ProjectProgress,
    default: ProjectProgress.NOT_STARTED,
  })
  progress: ProjectProgress;

  @Column({
    type: 'enum',
    enum: ProjectUrgency,
    default: ProjectUrgency.NORMAL,
  })
  urgency: ProjectUrgency;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column()
  ownerId: string;

  @ManyToOne(() => Account, (account) => account.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: Account;

  @CreateDateColumn()
  initiatedAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;
}
