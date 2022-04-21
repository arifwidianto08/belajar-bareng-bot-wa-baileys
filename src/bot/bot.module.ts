import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';

@Module({
  controllers: [BotController],
  providers: [BotService]
})
export class BotModule {}
