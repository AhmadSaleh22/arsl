import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed Mohamed' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+201234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'ahmed@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PATIENT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: true })
  @IsBoolean()
  termsAccepted: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  privacyAccepted: boolean;
}
