// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserStatus } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { phoneNumber, email, password, fullName, role, termsAccepted, privacyAccepted } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ phoneNumber }, ...(email ? [{ email }] : [])],
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this phone or email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
      role,
      termsAccepted,
      privacyAccepted,
      status: UserStatus.PENDING_VERIFICATION,
    });

    await this.userRepository.save(user);

    // Send OTP for phone verification
    await this.sendOtp(phoneNumber, 'registration');

    return {
      message: 'Registration successful. Please verify your phone number.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const { phoneNumber, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    if (!user.isPhoneVerified) {
      throw new UnauthorizedException('Please verify your phone number first');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
      ...tokens,
    };
  }

  async sendOtp(phoneNumber: string, purpose: string) {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiration time (60 seconds from now)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 
      parseInt(this.configService.get('OTP_EXPIRATION_SECONDS', '60'))
    );

    // Delete any existing OTPs for this phone and purpose
    await this.otpRepository.delete({ phoneNumber, purpose, isVerified: false });

    // Create new OTP
    const otp = this.otpRepository.create({
      phoneNumber,
      code,
      purpose,
      expiresAt,
    });

    await this.otpRepository.save(otp);

    // Send OTP via Twilio (implement based on your needs)
    await this.sendSms(phoneNumber, `Your verification code is: ${code}. Valid for 60 seconds.`);

    return {
      message: 'OTP sent successfully',
      expiresIn: 60,
    };
  }

  async verifyOtp(phoneNumber: string, code: string, purpose: string) {
    const otp = await this.otpRepository.findOne({
      where: { phoneNumber, code, purpose, isVerified: false },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark OTP as verified
    otp.isVerified = true;
    await this.otpRepository.save(otp);

    // If purpose is registration, activate the user
    if (purpose === 'registration') {
      const user = await this.userRepository.findOne({ where: { phoneNumber } });
      if (user) {
        user.isPhoneVerified = true;
        user.status = UserStatus.ACTIVE;
        await this.userRepository.save(user);
      }
    }

    return {
      message: 'OTP verified successfully',
      verified: true,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { phoneNumber, otpCode, newPassword } = resetPasswordDto;

    // Verify OTP first
    const otp = await this.otpRepository.findOne({
      where: { 
        phoneNumber, 
        code: otpCode, 
        purpose: 'password_reset',
        isVerified: false 
      },
    });

    if (!otp || new Date() > otp.expiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    // Mark OTP as verified
    otp.isVerified = true;
    await this.otpRepository.save(otp);

    return {
      message: 'Password reset successfully',
    };
  }

  async guestLogin() {
    // Generate temporary guest token
    const guestToken = this.jwtService.sign(
      { role: 'guest', type: 'guest' },
      { expiresIn: '24h' }
    );

    return {
      accessToken: guestToken,
      role: 'guest',
      message: 'Guest session created. Limited access granted.',
    };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '7d'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '30d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async sendSms(phoneNumber: string, message: string) {
    // Implement Twilio SMS sending
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: this.configService.get('TWILIO_PHONE_NUMBER'),
    //   to: phoneNumber
    // });
    
    // For development, just log it
    console.log(`SMS to ${phoneNumber}: ${message}`);
  }
}