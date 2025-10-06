import { IsMobilePhone, IsString, Length } from 'class-validator';
export class VerifyOtpDto {
  @IsMobilePhone() mobile: string;
  @IsString() @Length(4, 6) otp: string;
}
