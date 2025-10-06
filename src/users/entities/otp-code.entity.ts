import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('otp_codes')
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  mobile: string;

  @Column()
  code: string; // store hashed in prod

  @Column({ type: 'bigint' })
  expiresAt: number; // epoch ms

  @Column({ type: 'bigint', nullable: true })
  resendAllowedAt?: number; // epoch ms

  @CreateDateColumn() createdAt: Date;
}
