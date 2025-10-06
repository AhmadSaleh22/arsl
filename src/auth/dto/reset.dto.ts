import { IsMobilePhone, IsString, MinLength } from 'class-validator';
export class ResetDto {
  @IsMobilePhone() mobile: string;
  @IsString() otp: string;
  @IsString() @MinLength(6) newPassword: string;
  @IsString() @MinLength(6) newPasswordConfirm: string;
}
