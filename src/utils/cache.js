/**
 * High-performance, zero-dependency in-memory cache for read-heavy routes.
 * Eliminates roundtrip database latencies while guaranteeing freshness on mutations.
 */
class MemoryCache {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    set(key, data, ttlSeconds = 30) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }

    del(pattern) {
        if (!pattern) {
            this.cache.clear();
            return;
        }
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}

const cache = new MemoryCache();
module.exports = cache;
