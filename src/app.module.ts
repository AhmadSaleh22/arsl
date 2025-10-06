import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { EmergencyModule } from './emergency/emergency.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { HomeVisitsModule } from './home-visits/home-visits.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { AiRecommendationsModule } from './ai-recommendations/ai-recommendations.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // Schedule for cron jobs
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    DoctorsModule,
    AppointmentsModule,
    ConsultationsModule,
    EmergencyModule,
    MedicalRecordsModule,
    PrescriptionsModule,
    LaboratoriesModule,
    HomeVisitsModule,
    NotificationsModule,
    PaymentsModule,
    AiRecommendationsModule,
    DashboardModule,
  ],
})
export class AppModule {}
