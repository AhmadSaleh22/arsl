import { IsMobilePhone } from 'class-validator';
export class ResendOtpDto {
  @IsMobilePhone() mobile: string;
}
