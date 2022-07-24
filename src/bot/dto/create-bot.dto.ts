export class CreateBotDto {}

export class SendMessageDto {
  phone: string;
  message: string;
  token?: string;
}
