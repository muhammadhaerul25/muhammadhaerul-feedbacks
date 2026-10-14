/**
 * High-performance, zero-dependency in-memory cache for read-heavy routes.
 * Eliminates roundtrip database latencies while guaranteeing freshness on mutations.
 * Features auto-expiry, memory bound caps, and hit/miss analytics.
 */
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;

        // Periodic background cleanup every 60s (unref'd to prevent keeping Node process alive on exit)
        if (typeof setInterval !== 'undefined') {
            const interval = setInterval(() => this.cleanup(), 60000);
            if (interval.unref) interval.unref();
        }
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.misses++;
            return null;
        }
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        this.hits++;
        return item.data;
    }

    set(key, data, ttlSeconds = 30) {
        // Enforce max size limit (1000 keys) to prevent unbounded memory usage
        if (this.cache.size >= 1000) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

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
        // Invalidate portfolio:bootstrap whenever any CMS entity is updated
        this.cache.delete('portfolio:bootstrap');
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : '0%'
        };
    }
}

const cache = new MemoryCache();
module.exports = cache;
