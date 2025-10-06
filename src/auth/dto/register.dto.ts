import {
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEmail,
} from 'class-validator';
import { UserType } from '../../common/enums/user-type.enum';

export class RegisterDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty() mobile: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() type: string;
}
