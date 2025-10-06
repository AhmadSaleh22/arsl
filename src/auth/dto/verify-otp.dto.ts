import { IsNotEmpty, IsString, Length } from 'class-validator';
export class VerifyOtpDto {
  @IsString() @IsNotEmpty() mobile: string;
  @IsString() @Length(4, 10) otp: string;
}
