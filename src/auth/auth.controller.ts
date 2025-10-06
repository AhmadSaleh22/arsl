import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotDto } from './dto/forgot.dto';
import { ResetDto } from './dto/reset.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register') register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('resend-otp') resend(@Body() dto: ResendOtpDto) {
    return this.auth.resendOtp(dto);
  }

  @Post('verify-otp') verify(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.mobile, dto.otp);
  }

  @Post('login') login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('guest-login') guest() {
    return this.auth.guestLogin();
  }

  @Post('forgot-password') forgot(@Body() dto: ForgotDto) {
    return this.auth.forgot(dto);
  }

  @Post('reset-password') reset(@Body() dto: ResetDto) {
    return this.auth.reset(dto);
  }
}
