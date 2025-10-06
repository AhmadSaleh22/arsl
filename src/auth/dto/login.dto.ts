import {
  IsMobilePhone,
  IsOptional,
  IsString,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
export class LoginDto {
  @IsString() @IsNotEmpty() mobile: string;
  @IsString() @MinLength(6) password: string;
}
