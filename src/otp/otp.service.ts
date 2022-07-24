import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { CacheManagerService } from '../cache-manager/cache-manager.service';
import {
  generateRandomCode,
  getDefaultContent,
  getNowString,
  hash,
} from '../helper';
import { CreateOtpDto, OtpDto, VerifyOtpDto } from './otp.dto';

@Injectable()
export class OtpService {
  constructor(
    private cacheManager: CacheManagerService,
    private botService: BotService,
  ) {}

  async create(data: CreateOtpDto) {
    try {
      const {
        content = getDefaultContent(),
        expires_in = 300,
        otp_length = 6,
        phone,
      } = data;

      let otpDigits = '1';

      for (let i = 0; i < otp_length; i++) {
        otpDigits += '0';
      }

      const code = generateRandomCode(100_000, Number(otpDigits));
      const text = content.replace(/\%code\%/g, code);
      const created_at = getNowString();

      /**
       * To prevent security issues, we don't need to store any personal data
       * or the actual auth code that was generated. We only need to make sure
       * that when we need to compare, we can generate the same hash to compare
       * the values.
       *
       * This data expires after max 7 days and is removed by a TTL mechanism
       * shortly after. It is safe enough to not hash+salt the data,
       * we just need to make it non-reversible.
       */
      const MAX_VALIDITY_IN_SECONDS = parseInt(process.env.TTL) || expires_in; // 7 days, expressed in seconds

      const hashed_target = hash(phone);
      const hashed_target_string = hashed_target.toString();
      const hashed_code = hash(`${code}`);
      const expires_at = new Date(
        Math.floor(Date.now()) + expires_in * 1000,
      ).toISOString();

      await this.cacheManager.set(
        hashed_target_string,
        {
          code,
          text,
          created_at,
          hashed_target,
          hashed_code,
          expires_at,
        },
        MAX_VALIDITY_IN_SECONDS,
      );

      await this.botService
        .sendMessage({
          message: text,
          phone,
        })
        .then((resp) => {
          return resp;
        })
        .catch((err) => {
          throw err;
        });

      return {
        success: true,
        message:
          'OTP has been successfully created & sent to the recipient phone',
      };
    } catch (error) {
      throw new HttpException(
        error?.response || error,
        error?.meta?.statusCode ? error?.meta?.statusCode : 500,
      );
    }
  }

  async verify(data: VerifyOtpDto) {
    const { code, phone } = data;

    try {
      const hashed_target = hash(phone);
      const hashed_target_string = hashed_target.toString();
      const hashed_code = hash(`${code}`);

      const savedCode: OtpDto = (await this.cacheManager.get(
        hashed_target_string,
      )) as OtpDto;

      /**
       * This input doesn't even match an entry in the database. Maybe:
       * - the user tries to guess a code and makes a second try
       * - there was never any auth code generated in the first place
       * - the code expired and was wiped by the TTL mechanism
       * - wrong target or target type
       */

      if (!savedCode) {
        throw new HttpException('Invalid OTP.', HttpStatus.BAD_REQUEST);
      }

      /**
       * Once retrieved, every entry is wiped immediately, whether the input was correct or not.
       * Never let users guess authorization codes!
       */
      await this.cacheManager.del(hashed_target_string);

      /**
       * This scenario can happen for multiple reasons:
       * - the code expired and was not yet wiped by the TTL mechanism
       */
      const now = Math.floor(Date.now() / 1000);
      const expired_at =
        savedCode?.expires_at && new Date(savedCode?.expires_at).getTime();
      if (expired_at < now) {
        throw new HttpException('Invalid OTP.', HttpStatus.BAD_REQUEST);
      }

      /**
       * We have a match, but the given code does not match:
       * - the user typed in a wrong code
       * - the encryption key was changed
       * - the hash function gave a different result for some other reason
       */

      if (hashed_code !== savedCode.hashed_code) {
        throw new HttpException('Invalid OTP.', HttpStatus.BAD_REQUEST);
      }

      return {
        is_valid: true,
        message: 'OTP Valid.',
      };
    } catch (error) {
      throw new HttpException(
        error?.response || error,
        error?.meta?.statusCode ? error?.meta?.statusCode : 500,
      );
    }
  }
}
