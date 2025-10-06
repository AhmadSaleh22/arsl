import { IsNotEmpty, IsString, MinLength } from 'class-validator';
export class ResetDto {
  @IsString() @IsNotEmpty() mobile: string;
  @IsString() @IsNotEmpty() otp: string;
  @IsString() @MinLength(6) newPassword: string;
  @IsString() @MinLength(6) newPasswordConfirm: string;
}
