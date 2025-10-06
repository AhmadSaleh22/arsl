import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetDto } from './dto/reset.dto';
import { ForgotDto } from './dto/forgot.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../common/enums/role.enum';
import { UserType } from '../common/enums/user-type.enum';

function randomOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
    constructor(
        private users: UsersService,
        private jwt: JwtService,
        private cfg: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        // Only patient can self-register via mobile app
        if (![UserType.PATIENT].includes(dto.type)) {
            throw new BadRequestException(
                'Only Patient self-registration is allowed',
            );
        }
        const existing = await this.users.findByMobile(dto.mobile);
        if (existing) throw new BadRequestException('Mobile already in use');

        const user = await this.users.createUser({
            fullName: dto.fullName,
            mobile: dto.mobile,
            email: dto.email,
            password: dto.password,
            type: dto.type,
            roles: [Role.PATIENT],
        });

        // Issue OTP
        const otp = randomOtp();
        const ttlMs = Number(this.cfg.get('OTP_EXP_SECONDS')) * 1000;
        const lockMs = Number(this.cfg.get('OTP_RESEND_LOCK_SECONDS')) * 1000;
        await this.users.createOtp(dto.mobile, otp, ttlMs, lockMs);
        // TODO: integrate SMS provider here; for now, log
        // console.log(`[OTP] ${dto.mobile}: ${otp}`);

        return {
            message: 'Registered. Verify OTP sent to mobile',
            mobile: dto.mobile,
        };
    }

    async resendOtp({ mobile }: ResendOtpDto) {
        const last = await this.users.latestOtp(mobile);
        const now = Date.now();

        if (last && last.resendAllowedAt && now < last.resendAllowedAt) {
            const sec = Math.ceil((last.resendAllowedAt - now) / 1000);
            throw new BadRequestException(`Please wait ${sec}s before resending OTP`);
        }
        
        const otp = randomOtp();
        const ttlMs = Number(this.cfg.get('OTP_EXP_SECONDS')) * 1000;
        const lockMs = Number(this.cfg.get('OTP_RESEND_LOCK_SECONDS')) * 1000;

        await this.users.createOtp(mobile, otp, ttlMs, lockMs);

        // console.log(`[OTP] ${mobile}: ${otp}`);
        return { message: 'OTP resent' };
    }

    async verifyOtp(mobile: string, otp: string) {
        const record = await this.users.latestOtp(mobile);
        const now = Date.now();

        if (!record) throw new BadRequestException('No OTP requested');
        if (now > Number(record.expiresAt))
            throw new BadRequestException('OTP expired');
        if (record.code !== otp) throw new BadRequestException('Invalid OTP');
        await this.users.setVerified(mobile);
        await this.users.clearOtps(mobile);
        const user = await this.users.findByMobile(mobile);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const token = this.signToken({
            sub: user.id,
            mobile: user.mobile,
            roles: user.roles as any,
            type: user.type as any,
        });

        return { accessToken: token };
    }

    async login(dto: LoginDto) {
        const user = await this.users.findByMobile(dto.mobile);

        if (!user) throw new UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        if (!user.isVerified)
            throw new UnauthorizedException('Mobile not verified');

        const token = this.signToken({
            sub: user.id,
            mobile: user.mobile,
            roles: user.roles as any,
            type: user.type as any,
        });

        return { accessToken: token };
    }

    guestLogin() {
        const payload: JwtPayload = {
            sub: 'guest',
            mobile: 'guest',
            roles: [Role.GUEST],
            type: UserType.PATIENT,
            guest: true,
        };
        return { accessToken: this.signToken(payload) };
    }

    async forgot(dto: ForgotDto) {
        const user = await this.users.findByMobile(dto.mobile);
        if (!user) return { message: 'If the mobile exists, an OTP was sent' };

        const otp = randomOtp();
        const ttlMs = Number(this.cfg.get('OTP_EXP_SECONDS')) * 1000;
        const lockMs = Number(this.cfg.get('OTP_RESEND_LOCK_SECONDS')) * 1000;

        await this.users.createOtp(dto.mobile, otp, ttlMs, lockMs);
        return { message: 'OTP sent to mobile' };
    }

    async reset(dto: ResetDto) {
        if (dto.newPassword !== dto.newPasswordConfirm)
            throw new BadRequestException('Password confirmation mismatch');

        const record = await this.users.latestOtp(dto.mobile);
        const now = Date.now();

        if (!record) throw new BadRequestException('No OTP requested');
        if (now > Number(record.expiresAt))
            throw new BadRequestException('OTP expired');
        if (record.code !== dto.otp) throw new BadRequestException('Invalid OTP');

        const user = await this.users.findByMobile(dto.mobile);
        if (!user) throw new BadRequestException('User not found');

        user.passwordHash = await bcrypt.hash(dto.newPassword, 10);

        await (await (this as any).users['usersRepo']).save(user); // quick save via repo
        await this.users.clearOtps(dto.mobile);

        return { message: 'Password reset successful' };
    }

    private signToken(payload: JwtPayload) {
        return this.jwt.sign(payload);
    }
}
