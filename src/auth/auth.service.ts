import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeMobile } from '../common/phone.util';

function randomOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  private getNum(key: string, def = 0) {
    const v = this.cfg.get<string>(key);
    return v ? Number(v) : def;
  }

  private signToken(payload: any) {
    return this.jwt.sign(payload);
  }

  // ============ Register ============
  async register(dto: {
    fullName: string;
    mobile: string;
    email?: string;
    password: string;
    type: string;
  }) {
    const mobile = normalizeMobile(dto.mobile);
    if (dto.type?.toLowerCase() !== 'patient') {
      throw new BadRequestException(
        'Only Patient self-registration is allowed',
      );
    }

    const exist = await this.prisma.user.findUnique({ where: { mobile } });
    if (exist) throw new BadRequestException('Mobile already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        mobile,
        email: dto.email ?? null,
        passwordHash,
        type: dto.type,
        roles: ['patient'],
      },
    });

    // create OTP
    const otp = randomOtp();
    const hashedCode = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(
      Date.now() + this.getNum('OTP_EXP_SECONDS', 180) * 1000,
    );
    const resendAllowedAt = new Date(
      Date.now() + this.getNum('OTP_RESEND_LOCK_SECONDS', 60) * 1000,
    );

    await this.prisma.otpCode.create({
      data: { mobile, hashedCode, expiresAt, resendAllowedAt },
    });

    // DEV only
    console.log('[DEV OTP]', mobile, otp);

    return { message: 'Registered. Verify OTP sent to mobile', mobile };
  }

  // ============ Resend OTP ============
  async resendOtp(mobileRaw: string) {
    const mobile = normalizeMobile(mobileRaw);
    const last = await this.prisma.otpCode.findFirst({
      where: { mobile },
      orderBy: { createdAt: 'desc' },
    });
    const now = new Date();
    if (last?.resendAllowedAt && last.resendAllowedAt > now) {
      const sec = Math.ceil(
        (last.resendAllowedAt.getTime() - now.getTime()) / 1000,
      );
      throw new BadRequestException(`Please wait ${sec}s before resending OTP`);
    }

    const otp = randomOtp();
    const hashedCode = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(
      Date.now() + this.getNum('OTP_EXP_SECONDS', 180) * 1000,
    );
    const resendAllowedAt = new Date(
      Date.now() + this.getNum('OTP_RESEND_LOCK_SECONDS', 60) * 1000,
    );

    await this.prisma.otpCode.create({
      data: { mobile, hashedCode, expiresAt, resendAllowedAt },
    });
    console.log('[DEV OTP]', mobile, otp);
    return { message: 'OTP resent' };
  }

  // ============ Verify OTP (with brute-force protection) ============
  async verifyOtp(mobileRaw: string, otp: string) {
    const mobile = normalizeMobile(mobileRaw);

    const attempt = await this.prisma.otpAttempt.findUnique({
      where: { mobile },
    });
    const now = new Date();
    if (attempt?.blockedUntil && attempt.blockedUntil > now) {
      throw new BadRequestException(
        `Blocked. Try after ${attempt.blockedUntil.toISOString()}`,
      );
    }

    const record = await this.prisma.otpCode.findFirst({
      where: { mobile },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('No OTP requested');

    if (record.expiresAt.getTime() < Date.now()) {
      await this.prisma.otpCode.deleteMany({ where: { mobile } }); // cleanup expired
      throw new BadRequestException('OTP expired');
    }

    const ok = await bcrypt.compare(otp, record.hashedCode);
    if (!ok) {
      const max = this.getNum('MAX_OTP_ATTEMPTS', 5);
      const blockSec = this.getNum('OTP_BLOCK_SECONDS', 900);

      if (!attempt) {
        await this.prisma.otpAttempt.create({ data: { mobile, attempts: 1 } });
      } else {
        const attempts = attempt.attempts + 1;
        const data: any = { attempts };
        if (attempts >= max)
          data.blockedUntil = new Date(Date.now() + blockSec * 1000);
        await this.prisma.otpAttempt.update({ where: { mobile }, data });
      }
      throw new BadRequestException('Invalid OTP');
    }

    // success: verify user & cleanup
    await this.prisma.user.update({
      where: { mobile },
      data: { isVerified: true },
    });
    await this.prisma.otpCode.deleteMany({ where: { mobile } });
    await this.prisma.otpAttempt.upsert({
      where: { mobile },
      update: { attempts: 0, blockedUntil: null },
      create: { mobile, attempts: 0 },
    });

    const user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      throw new NotFoundException('User is Not found');
    }
    const token = this.signToken({
      sub: user.id,
      mobile: user.mobile,
      roles: user.roles,
      type: user.type,
    });
    return { accessToken: token };
  }

  // ============ Forgot / Reset ============
  async forgot(mobileRaw: string) {
    const mobile = normalizeMobile(mobileRaw);
    const user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user) return { message: 'If the mobile exists, an OTP was sent' };

    const otp = randomOtp();
    const hashedCode = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(
      Date.now() + this.getNum('OTP_EXP_SECONDS', 180) * 1000,
    );
    const resendAllowedAt = new Date(
      Date.now() + this.getNum('OTP_RESEND_LOCK_SECONDS', 60) * 1000,
    );

    await this.prisma.otpCode.create({
      data: { mobile, hashedCode, expiresAt, resendAllowedAt },
    });
    console.log('[DEV OTP]', mobile, otp);
    return { message: 'If the mobile exists, an OTP was sent' };
  }

  async reset(dto: {
    mobile: string;
    otp: string;
    newPassword: string;
    newPasswordConfirm: string;
  }) {
    const mobile = normalizeMobile(dto.mobile);
    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new BadRequestException('Password confirmation mismatch');
    }

    const record = await this.prisma.otpCode.findFirst({
      where: { mobile },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('No OTP requested');

    if (record.expiresAt.getTime() < Date.now()) {
      await this.prisma.otpCode.deleteMany({ where: { mobile } });
      throw new BadRequestException('OTP expired');
    }

    const ok = await bcrypt.compare(dto.otp, record.hashedCode);
    if (!ok) throw new BadRequestException('Invalid OTP');

    const user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user) throw new BadRequestException('User not found');

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { mobile },
      data: { passwordHash: newHash },
    });
    await this.prisma.otpCode.deleteMany({ where: { mobile } });
    return { message: 'Password reset successful' };
  }

  // ============ Login (with brute-force protection) ============
  async login(dto: { mobile: string; password: string }) {
    const mobile = normalizeMobile(dto.mobile);

    const la = await this.prisma.loginAttempt.findUnique({ where: { mobile } });
    const now = new Date();
    if (la?.blockedUntil && la.blockedUntil > now) {
      throw new BadRequestException(
        `Blocked. Try after ${la.blockedUntil.toISOString()}`,
      );
    }

    const user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      const max = this.getNum('MAX_LOGIN_ATTEMPTS', 5);
      const blockSec = this.getNum('LOGIN_BLOCK_SECONDS', 900);

      if (!la) {
        await this.prisma.loginAttempt.create({
          data: { mobile, attempts: 1 },
        });
      } else {
        const attempts = la.attempts + 1;
        const data: any = { attempts };
        if (attempts >= max)
          data.blockedUntil = new Date(Date.now() + blockSec * 1000);
        await this.prisma.loginAttempt.update({ where: { mobile }, data });
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified)
      throw new UnauthorizedException('Mobile not verified');

    await this.prisma.loginAttempt.upsert({
      where: { mobile },
      update: { attempts: 0, blockedUntil: null },
      create: { mobile, attempts: 0 },
    });

    const token = this.signToken({
      sub: user.id,
      mobile: user.mobile,
      roles: user.roles,
      type: user.type,
    });
    return { accessToken: token };
  }

  // ============ Guest ============
  guestLogin() {
    const payload = {
      sub: 'guest',
      mobile: 'guest',
      roles: ['guest'],
      type: 'patient',
      guest: true,
    };
    return { accessToken: this.signToken(payload) };
  }
}
