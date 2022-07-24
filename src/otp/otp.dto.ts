export class CreateOtpDto {
  phone: string;
  otp_length: number;
  content: string;
  expires_in: number;
}

export class VerifyOtpDto {
  phone: string;
  code: string;
}

export class OtpDto {
  code: string;
  text: string;
  created_at: string;
  hashed_target: string;
  hashed_code: string;
  expires_at: string;
}
