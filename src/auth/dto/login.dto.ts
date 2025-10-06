import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+201234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+201234567890' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+201234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phoneNumber: string;

  @ApiProperty({ example: 'registration' })
  @IsString()
  purpose: string;
}
