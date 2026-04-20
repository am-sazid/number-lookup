const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    return this.cache.set(key, value);
  }

  generateKey(prefix, data) {
    return `${prefix}:${JSON.stringify(data)}`;
  }
}

module.exports = new CacheService();