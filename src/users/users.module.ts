import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OtpCode } from './entities/otp-code.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, OtpCode])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
