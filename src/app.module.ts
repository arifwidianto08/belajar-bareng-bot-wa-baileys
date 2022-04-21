import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [BotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
