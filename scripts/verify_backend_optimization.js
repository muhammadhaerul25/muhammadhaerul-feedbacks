require('dotenv/config');

const BASE_URL = 'http://localhost:4000';

async function runTests() {
    console.log('====================================================');
    console.log('   BACKEND & DATABASE OPTIMIZATION TEST SUITE       ');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName, details = '') {
        if (condition) {
            console.log(`✓ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`✗ FAIL: ${testName} ${details ? '- ' + details : ''}`);
            failed++;
        }
    }

    try {
        // --- TEST 1: Healthcheck with DB Pool & Cache Metrics ---
        console.log('[1] Checking GET /api/health ...');
        const healthRes = await fetch(`${BASE_URL}/api/health`);
        const healthData = await healthRes.json();
        assert(healthRes.status === 200, 'Health endpoint status is 200');
        assert(healthData.success === true, 'Health check success is true');
        assert(healthData.database && healthData.database.status === 'healthy', 'Database status is healthy');
        assert(healthData.database.pool && typeof healthData.database.pool.totalCount === 'number', 'Database pool metrics returned');
        assert(healthData.cache && typeof healthData.cache.size === 'number', 'Cache metrics returned');
        assert(healthRes.headers.get('x-response-time'), 'X-Response-Time header is present');
        assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options is nosniff');
        assert(healthRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options is SAMEORIGIN');
        console.log('    DB Pool Stats:', healthData.database.pool);
        console.log('    Cache Stats:', healthData.cache);
        console.log('    Latency:', `${healthData.database.latencyMs}ms\n`);

        // --- TEST 2: Keep-Alive Ping Endpoint ---
        console.log('[2] Checking GET /api/keep-alive ...');
        const keepAliveRes = await fetch(`${BASE_URL}/api/keep-alive`);
        const keepAliveData = await keepAliveRes.json();
        assert(keepAliveRes.status === 200, 'Keep-alive status is 200');
        assert(keepAliveData.success === true, 'Keep-alive success is true');
        console.log('    Keep-alive latency:', `${keepAliveData.latencyMs}ms\n`);

        // --- TEST 3: Public Endpoints & In-Memory Caching ---
        console.log('[3] Checking Public Caching Endpoints ...');
        const endpoints = [
            '/api/projects',
            '/api/talks',
            '/api/experiences',
            '/api/educations',
            '/api/certifications',
            '/api/awards'
        ];
        for (const ep of endpoints) {
            // First call (may be MISS or HIT)
            const r1 = await fetch(`${BASE_URL}${ep}`);
            const d1 = await r1.json();
            assert(r1.status === 200 && d1.success === true, `${ep} returns 200 OK`);

            // Second call (must be HIT)
            const r2 = await fetch(`${BASE_URL}${ep}`);
            const cacheHeader = r2.headers.get('x-cache');
            assert(cacheHeader === 'HIT', `${ep} returns X-Cache: HIT on subsequent request`);
        }
        console.log('');

        // --- TEST 4: Unauthorized Mutation Blocking (Security Hardening) ---
        console.log('[4] Verifying Unauthorized Mutations are Blocked ...');
        
        // 4a. POST /api/projects without token
        const projBlock = await fetch(`${BASE_URL}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Hacker Project' })
        });
        assert(projBlock.status === 401, 'POST /api/projects without auth blocked with 401');

        // 4b. DELETE /api/talks/123 without token
        const talkBlock = await fetch(`${BASE_URL}/api/talks/test-id`, {
            method: 'DELETE'
        });
        assert(talkBlock.status === 401, 'DELETE /api/talks/:id without auth blocked with 401');

        // 4c. POST /api/forms without token
        const formBlock = await fetch(`${BASE_URL}/api/forms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Rogue Form' })
        });
        assert(formBlock.status === 401, 'POST /api/forms without auth blocked with 401');

        // 4d. DELETE /api/feedbacks/123 without token
        const fbBlock = await fetch(`${BASE_URL}/api/feedbacks/9999`, {
            method: 'DELETE'
        });
        assert(fbBlock.status === 401, 'DELETE /api/feedbacks/:id without auth blocked with 401');
        console.log('');

        // --- TEST 5: Password Authentication & PBKDF2 Migration ---
        console.log('[5] Checking Password Authentication & PBKDF2 Migration ...');
        // 5a. Invalid password
        const wrongAuth = await fetch(`${BASE_URL}/api/auth/login-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'IncorrectPassword999' })
        });
        assert(wrongAuth.status === 401, 'Invalid password rejected with 401');

        // 5b. Valid password login
        const validAuth = await fetch(`${BASE_URL}/api/auth/login-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'HaerulPortfolio-2512' })
        });
        const validAuthData = await validAuth.json();
        assert(validAuth.status === 200 && validAuthData.success === true, 'Valid password accepted with 200 OK');
        assert(!!validAuthData.token, 'Session token returned upon successful login');
        
        const adminToken = validAuthData.token;
        const cookieHeader = validAuth.headers.get('set-cookie');
        assert(cookieHeader && cookieHeader.includes('mh_admin_session='), 'HTTP-only session cookie set');

        // 5c. Verify DB row was migrated to PBKDF2
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        const passRow = await pool.query("SELECT value FROM admin_security WHERE key = 'admin_password' LIMIT 1;");
        const storedPass = passRow.rows[0] ? passRow.rows[0].value : '';
        assert(storedPass.startsWith('pbkdf2:100000:'), 'Database password was transparently upgraded to PBKDF2');
        console.log('    Stored Password Format:', storedPass.slice(0, 30) + '...');
        await pool.end();

        // 5d. Second login with already hashed password
        const reAuth = await fetch(`${BASE_URL}/api/auth/login-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'HaerulPortfolio-2512' })
        });
        const reAuthData = await reAuth.json();
        assert(reAuth.status === 200 && reAuthData.success === true, 'Subsequent login with PBKDF2 hashed password works seamlessly');
        console.log('');

        // --- TEST 6: Authenticated Mutation Test ---
        console.log('[6] Checking Authenticated Admin Action ...');
        const adminCheck = await fetch(`${BASE_URL}/api/auth/admins`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const adminData = await adminCheck.json();
        assert(adminCheck.status === 200 && adminData.success === true, 'Authenticated admin can list admins');
        console.log('    Authorized Admins count:', adminData.count, '\n');

        // --- TEST 7: Contact Submission Rate Limiting & Inbox ---
        console.log('[7] Checking Contact Form Submission & Limiter ...');
        const contactSub = await fetch(`${BASE_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Security Test Auditor',
                email: 'security.test@example.com',
                message: 'Testing backend optimization, security rate limiting, and database indexes.'
            })
        });
        const contactSubData = await contactSub.json();
        assert(contactSub.status === 201 && contactSubData.success === true, 'Contact message submitted with 201 Created');
        
        // Clean up test message using admin token
        if (contactSubData.data && contactSubData.data.id) {
            const delMsg = await fetch(`${BASE_URL}/api/contact/${contactSubData.data.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            assert(delMsg.status === 200, 'Test contact message deleted cleanly by admin');
        }
        console.log('');

    } catch (err) {
        console.error('Fatal Test Exception:', err);
        failed++;
    }

    console.log('====================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
