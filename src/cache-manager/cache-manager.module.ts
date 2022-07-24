import { CacheModule, Module } from '@nestjs/common';
// import * as CacheManagerStore from 'cache-manager-CacheManager-store'
import { CacheManagerService } from './cache-manager.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          ttl: Number(process.env.TTL || 300), // set default 600 seconds
        };
      },
    }),
  ],
  providers: [CacheManagerService],
  exports: [CacheManagerModule, CacheManagerService],
})
export class CacheManagerModule {}
