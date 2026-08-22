const http = require('http');
const app = require('../src/app');
const prisma = require('../src/config/db');

async function testRequest(server, path, options = {}) {
    const port = server.address().port;
    return new Promise((resolve, reject) => {
        const headers = options.headers || {};
        if (options.body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const req = http.request(`http://127.0.0.1:${port}${path}`, { ...options, headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(data); } catch (e) {}
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: json || data
                });
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runComprehensiveTests() {
    console.log('🚀 Starting Full End-to-End Routing Lifecycle Verification...\n');
    const server = app.listen(0);
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✅ ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        // 1. Healthcheck & System Metrics
        console.log('1. Testing /api/health');
        const health = await testRequest(server, '/api/health');
        assert(health.statusCode === 200, 'Status code is 200');
        assert(health.body.success === true, 'Healthcheck success is true');
        assert(health.body.database && health.body.database.status === 'healthy', 'Database status is healthy');
        assert(health.headers['x-response-time'] !== undefined, 'X-Response-Time header is present');

        // 2. Forms Lifecycle
        console.log('\n2. Testing Form Creation, Slug Fetch, and Response Submission');
        const testSlug = `test-form-${Date.now()}`;
        const createFormRes = await testRequest(server, '/api/forms', {
            method: 'POST',
            body: {
                title: `Automated Test Form ${Date.now()}`,
                description: 'Test Description',
                type: 'feedback',
                tag: 'automated-test'
            }
        });
        assert(createFormRes.statusCode === 201 && createFormRes.body.success, 'Form created with 201 Created');
        const createdForm = createFormRes.body.data;
        const formId = createdForm.id;
        const formSlug = createdForm.slug;

        // Fetch form by slug
        const getFormRes = await testRequest(server, `/api/forms/${formSlug}`);
        assert(getFormRes.statusCode === 200 && getFormRes.body.data.id === formId, 'Form retrieved by slug');
        assert(getFormRes.body.data.fields.length > 0, 'Form fields loaded automatically');

        // Submit response to form
        const field0 = getFormRes.body.data.fields[0];
        const field1 = getFormRes.body.data.fields[1];
        const field2 = getFormRes.body.data.fields[2];
        const submitRes = await testRequest(server, `/api/forms/${formSlug}/responses`, {
            method: 'POST',
            body: {
                data: {
                    [field0.id]: 'Tester Name',
                    [field1.id]: 'tester@example.com',
                    [field2.id]: '10'
                }
            }
        });
        assert(submitRes.statusCode === 201 && submitRes.body.success, 'Response submitted successfully');

        // Get responses for form
        const getResponsesRes = await testRequest(server, `/api/forms/${formId}/responses`);
        assert(getResponsesRes.statusCode === 200 && getResponsesRes.body.data.length > 0, 'Form responses retrieved');

        // Clean up created form
        const deleteFormRes = await testRequest(server, `/api/forms/${formId}`, { method: 'DELETE' });
        assert(deleteFormRes.statusCode === 200 && deleteFormRes.body.success, 'Form deleted successfully');

        // 3. Projects Endpoint
        console.log('\n3. Testing Projects API');
        const projectsRes = await testRequest(server, '/api/projects');
        assert(projectsRes.statusCode === 200 && Array.isArray(projectsRes.body.data), 'GET /api/projects returns array');

        // 4. Talks Endpoint
        console.log('\n4. Testing Talks API');
        const talksRes = await testRequest(server, '/api/talks');
        assert(talksRes.statusCode === 200 && Array.isArray(talksRes.body.data), 'GET /api/talks returns array');

        // 5. Materi Options
        console.log('\n5. Testing Materi API');
        const createMateri = await testRequest(server, '/api/materi', {
            method: 'POST',
            body: { name: `Topic ${Date.now()}` }
        });
        assert(createMateri.statusCode === 201 && createMateri.body.data.id, 'POST /api/materi creates topic');
        const createdMateriId = createMateri.body.data.id;

        const deleteMateri = await testRequest(server, `/api/materi/${createdMateriId}`, { method: 'DELETE' });
        assert(deleteMateri.statusCode === 200 && deleteMateri.body.success, 'DELETE /api/materi/:id deletes topic');

        console.log(`\n========================================`);
        console.log(`Total lifecycle tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
        console.log(`========================================\n`);

    } catch (err) {
        console.error('Lifecycle test error:', err);
    } finally {
        server.close();
        await prisma.$disconnect();
        process.exit(failed > 0 ? 1 : 0);
    }
}

runComprehensiveTests();
