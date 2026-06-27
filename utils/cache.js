"use strict";

/**
 * -------------------------------------------------------
 * MultiVerse Bot
 * utils/cache.js
 * -------------------------------------------------------
 * Features:
 * - TTL based cache
 * - Simple wrapper around node-cache
 * - API response caching
 * - Auto expiration
 * - Cache statistics
 * - Flush support
 * -------------------------------------------------------
 */

const NodeCache = require("node-cache");
const config = require("../config");
const logger = require("./logger");

const cache = new NodeCache({
    stdTTL: config.cache.ttl,
    checkperiod: 120,
    useClones: false,
    deleteOnExpire: true
});

cache.on("expired", (key) => {
    logger.debug(`Cache expired: ${key}`);
});

cache.on("flush", () => {
    logger.info("Cache flushed.");
});

module.exports = {

    /**
     * Get value from cache
     * @param {string} key
     * @returns {*|undefined}
     */
    get(key) {
        return cache.get(key);
    },

    /**
     * Save value
     * @param {string} key
     * @param {*} value
     * @param {number} ttl
     * @returns {boolean}
     */
    set(key, value, ttl = config.cache.ttl) {
        return cache.set(key, value, ttl);
    },

    /**
     * Check key exists
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return cache.has(key);
    },

    /**
     * Delete key
     * @param {string} key
     * @returns {number}
     */
    del(key) {
        return cache.del(key);
    },

    /**
     * Clear all cache
     */
    flush() {
        cache.flushAll();
    },

    /**
     * Get all keys
     * @returns {string[]}
     */
    keys() {
        return cache.keys();
    },

    /**
     * Cache statistics
     */
    stats() {
        return cache.getStats();
    },

    /**
     * Cached fetch helper
     * @param {string} key
     * @param {Function} fetcher
     * @param {number} ttl
     * @returns {Promise<any>}
     */
    async remember(key, fetcher, ttl = config.cache.ttl) {

        const cached = cache.get(key);

        if (cached !== undefined) {
            return cached;
        }

        const result = await fetcher();

        cache.set(key, result, ttl);

        return result;
    }
};
