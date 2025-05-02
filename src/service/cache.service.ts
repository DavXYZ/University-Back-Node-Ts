// src/services/cache.service.ts
import redisClient from "../config/redis";

export class CacheService {
  private readonly serviceName = "CacheService";

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    redisClient.on("connect", () => {
      console.log(`[${this.serviceName}] Connected to Redis`);
    });

    redisClient.on("error", (err) => {
      console.error(`[${this.serviceName}] Redis error:`, err);
    });

    redisClient.on("ready", () => {
      console.log(`[${this.serviceName}] Redis client ready`);
    });

    redisClient.on("reconnecting", () => {
      console.log(`[${this.serviceName}] Reconnecting to Redis`);
    });
  }

  public async get(key: string): Promise<string | null> {
    try {
      const value = await redisClient.get(key);
      console.debug(`[${this.serviceName}] Cache GET ${key}:`, value ? "HIT" : "MISS");
      return value;
    } catch (error) {
      console.error(`[${this.serviceName}] Error getting key ${key}:`, error);
      return null;
    }
  }

  public async set(
    key: string,
    value: string,
    ttl: number = 3600
  ): Promise<boolean> {
    try {
      if (ttl > 0) {
        await redisClient.setex(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
      console.debug(`[${this.serviceName}] Cache SET ${key} with TTL ${ttl} seconds`);
      return true;
    } catch (error) {
      console.error(`[${this.serviceName}] Error setting key ${key}:`, error);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      const result = await redisClient.del(key);
      console.debug(`[${this.serviceName}] Cache DEL ${key}:`, result ? "SUCCESS" : "NOT FOUND");
      return result > 0;
    } catch (error) {
      console.error(`[${this.serviceName}] Error deleting key ${key}:`, error);
      return false;
    }
  }

  public async flush(): Promise<boolean> {
    try {
      await redisClient.flushdb();
      console.log(`[${this.serviceName}] Cache FLUSH: All keys cleared`);
      return true;
    } catch (error) {
      console.error(`[${this.serviceName}] Error flushing cache:`, error);
      return false;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await redisClient.ping();
      return true;
    } catch (error) {
      console.error(`[${this.serviceName}] Redis health check failed:`, error);
      return false;
    }
  }
}