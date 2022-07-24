import { Body, Controller, Post } from '@nestjs/common';
import { CreateOtpDto, VerifyOtpDto } from './otp.dto';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  create(@Body() data: CreateOtpDto) {
    return this.otpService.create(data);
  }

  @Post('/verify')
  verify(@Body() data: VerifyOtpDto) {
    return this.otpService.verify(data);
  }
}
