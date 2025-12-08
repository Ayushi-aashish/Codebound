import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { PermissionLevel } from '../../shared/constants/permission-levels.enum';
import { Project } from '../../project/models/project.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  accountId: string;

  @Column({ unique: true })
  emailAddress: string;

  @Column()
  @Exclude()
  secretKey: string;

  @Column()
  givenName: string;

  @Column()
  familyName: string;

  @Column({
    type: 'enum',
    enum: PermissionLevel,
    default: PermissionLevel.STANDARD,
  })
  permissionLevel: PermissionLevel;

  @Column({ default: true })
  accountActive: boolean;

  @CreateDateColumn()
  registeredAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];
}
