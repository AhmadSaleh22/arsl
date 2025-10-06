import { IsMobilePhone } from 'class-validator';
export class ForgotDto {
  @IsMobilePhone() mobile: string;
}
