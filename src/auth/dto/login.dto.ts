import {
  IsMobilePhone,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
export class LoginDto {
  @IsMobilePhone() mobile: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() rememberMe?: boolean;
}
