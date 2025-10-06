import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { OtpCode } from './entities/otp-code.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(OtpCode) private otpRepo: Repository<OtpCode>,
  ) {}

  findByMobile(mobile: string) {
    return this.usersRepo.findOne({ where: { mobile } });
  }
  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(dto: {
    fullName: string;
    mobile: string;
    email?: string;
    password: string;
    type: string;
    roles?: string[];
  }) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      fullName: dto.fullName,
      mobile: dto.mobile,
      email: dto.email,
      passwordHash,
      type: dto.type as any,
      roles: (dto.roles as any) ?? undefined,
    });
    return this.usersRepo.save(user);
  }
  

  async setVerified(mobile: string) {
    await this.usersRepo.update({ mobile }, { isVerified: true });
  }

  // OTP helpers
  async createOtp(
    mobile: string,
    code: string,
    ttlMs: number,
    resendLockMs: number,
  ) {
    const now = Date.now();
    const otp = this.otpRepo.create({
      mobile,
      code,
      expiresAt: now + ttlMs,
      resendAllowedAt: now + resendLockMs,
    });
    return this.otpRepo.save(otp);
  }

  async latestOtp(mobile: string) {
    return this.otpRepo
      .find({ where: { mobile }, order: { createdAt: 'DESC' }, take: 1 })
      .then((arr) => arr[0]);
  }

  async clearOtps(mobile: string) {
    await this.otpRepo.delete({ mobile });
  }
}
