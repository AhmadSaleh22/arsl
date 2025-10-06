import { IsString, IsNotEmpty } from 'class-validator';
export class ForgotDto {
  @IsString() @IsNotEmpty() mobile: string;
}
