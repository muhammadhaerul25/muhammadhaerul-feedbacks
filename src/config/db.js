require('dotenv/config');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('CRITICAL: DATABASE_URL environment variable is missing.');
    process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = connectionString.includes('sslmode=require') || 
                    connectionString.includes('supabase.co') || 
                    connectionString.includes('neon.tech') || 
                    isProduction;

// Global singleton registry across process restarts / serverless invocations
const globalForDb = globalThis;

let pool = globalForDb.__pgPool;
if (!pool) {
    pool = new Pool({
        connectionString,
        max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : (isProduction ? 10 : 5),
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 8000,
        statement_timeout: 20000, // Abort queries taking longer than 20s
        query_timeout: 20000,
        keepAlive: true,
        ssl: requiresSsl ? { rejectUnauthorized: false } : undefined
    });

    // CRITICAL: Catch errors on idle clients so they do not crash the Node.js process
    pool.on('error', (err) => {
        console.error('[PostgreSQL Pool Unexpected Error on Idle Client]:', err.message);
    });

    if (!isProduction) {
        globalForDb.__pgPool = pool;
    }
}

let prisma = globalForDb.__prisma;
if (!prisma) {
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ 
        adapter,
        log: isProduction ? ['error', 'warn'] : ['error', 'warn']
    });

    if (!isProduction) {
        globalForDb.__prisma = prisma;
    }
}

/**
 * Returns current PostgreSQL pool connection metrics
 */
function getPoolStats() {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    };
}

/**
 * Perform a database latency & connectivity check
 */
async function checkDbHealth() {
    const start = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        return {
            status: 'healthy',
            latencyMs: Date.now() - start,
            pool: getPoolStats()
        };
    } catch (err) {
        return {
            status: 'degraded',
            latencyMs: Date.now() - start,
            error: err.message,
            pool: getPoolStats()
        };
    }
}

// Attach helpers to the prisma client instance for zero-breaking backward compatibility
prisma.pool = pool;
prisma.getPoolStats = getPoolStats;
prisma.checkDbHealth = checkDbHealth;

module.exports = prisma;
