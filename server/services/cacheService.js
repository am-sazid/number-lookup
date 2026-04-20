const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.cache = new NodeCache({ 
      stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600,
      checkperiod: 120,
      maxKeys: 1000
    });
    
    this.stats = { hits: 0, misses: 0 };
  }

  get(key) {
    const value = this.cache.get(key);
    if (value) {
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return null;
  }

  set(key, value, ttl = null) {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  getStats() {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: this.cache.keys().length,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  generateKey(prefix, data) {
    return `${prefix}:${JSON.stringify(data)}`;
  }
}

module.exports = new CacheService();