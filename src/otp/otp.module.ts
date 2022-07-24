import { Module } from '@nestjs/common';
import { BotModule } from 'src/bot/bot.module';
import { CacheManagerModule } from '../cache-manager/cache-manager.module';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
  imports: [CacheManagerModule, BotModule],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
