import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [BotModule, OtpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
