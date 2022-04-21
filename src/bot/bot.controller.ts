import { Body, Controller, Post } from '@nestjs/common';
import { BotService } from './bot.service';
import { SendMessageDto } from './dto/create-bot.dto';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post()
  create() {
    return this.botService.create();
  }

  @Post('/send-message')
  async sendMessage(@Body() data: SendMessageDto) {
    return await this.botService.sendMessage(data);
  }
}
