
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  version: string;
}

class CacheService {
  private readonly CACHE_PREFIX = 'sockDesign_';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CURRENT_VERSION = '1.0.0';

  // Get from cache with version check
  async get<T>(key: string, config?: Partial<CacheConfig>): Promise<T | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      const ttl = config?.ttl || this.DEFAULT_TTL;
      const version = config?.version || this.CURRENT_VERSION;
      
      // Check version and expiration
      if (entry.version !== version || (now - entry.timestamp) > ttl) {
        this.delete(key);
        return null;
      }
      
      console.log('缓存命中:', key);
      return entry.data;
    } catch (error) {
      console.error('缓存读取失败:', error);
      return null;
    }
  }

  // Set cache with version
  async set<T>(key: string, data: T, config?: Partial<CacheConfig>): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const version = config?.version || this.CURRENT_VERSION;
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(entry));
      console.log('数据已缓存:', key);
    } catch (error) {
      console.error('缓存写入失败:', error);
      // If localStorage is full, try to clear old entries
      this.cleanup();
    }
  }

  // Delete specific cache entry
  delete(key: string): void {
    const cacheKey = this.CACHE_PREFIX + key;
    localStorage.removeItem(cacheKey);
  }

  // Clear all cache entries
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('缓存已清空');
  }

  // Cleanup expired entries
  private cleanup(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry = JSON.parse(cached);
            if ((now - entry.timestamp) > this.DEFAULT_TTL) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Get cache key for user-specific data
  getUserCacheKey(userId: string, key: string): string {
    return `user_${userId}_${key}`;
  }
}

export const cacheService = new CacheService();
