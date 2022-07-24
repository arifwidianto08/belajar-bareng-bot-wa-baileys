import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheManagerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string) {
    return await this.cacheManager.get(key);
  }

  async set(key: string, value: object, ttl: number = 300) {
    return await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string) {
    return await this.cacheManager.del(key);
  }

  async reset() {
    return await this.cacheManager.reset();
  }
}
