const cacheStore = new Map();

const cache = {
  set: (key, value, ttlInSeconds = 300) => {
    if (!key) return false;
    const expiresAt = Date.now() + (ttlInSeconds * 1000);
    cacheStore.set(key, {
      data: value,
      expiresAt
    });
    return true;
  },

  get: (key) => {
    const cachedItem = cacheStore.get(key);
    if (!cachedItem) return null;

    if (Date.now() > cachedItem.expiresAt) {
      cacheStore.delete(key);
      return null;
    }

    return cachedItem.data;
  },

  has: (key) => {
    const cachedItem = cacheStore.get(key);
    if (!cachedItem) return false;

    if (Date.now() > cachedItem.expiresAt) {
      cacheStore.delete(key);
      return false;
    }

    return true;
  },

  delete: (key) => {
    return cacheStore.delete(key);
  },

  clear: () => {
    cacheStore.clear();
    return true;
  },

  size: () => {
    return cacheStore.size;
  },

  flushExpired: () => {
    const now = Date.now();
    let count = 0;
    for (const [key, value] of cacheStore.entries()) {
      if (now > value.expiresAt) {
        cacheStore.delete(key);
        count++;
      }
    }
    return count;
  }
};

setInterval(() => {
  cache.flushExpired();
}, 60000).unref();

module.exports = cache;
