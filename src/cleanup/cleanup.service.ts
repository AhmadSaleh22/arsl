import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CleanupService {
    private readonly logger = new Logger(CleanupService.name);
    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleCleanup() {
        try {
            const res = await this.prisma.otpCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });
            if (res.count > 0) this.logger.log(`Deleted ${res.count} expired OTP records`);
        } catch (e) {
            this.logger.error(e);
        }
    }
}
