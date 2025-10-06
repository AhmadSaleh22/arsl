import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../../common/enums/user-type.enum';
import { Role } from '../../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  mobile: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.PATIENT })
  type: UserType;

  @Column('simple-array', {
    default: Role.PATIENT,
  })
  roles: Role[];

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
