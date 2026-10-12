require('dotenv/config');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    console.log('--- Optimizing Database Indexes ---');

    const statements = [
        // 1. Index on contact_messages.status for fast unread count and filtering
        `CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages (status);`,
        // 2. Compound index on contact_messages (status, created_at DESC) for filtered inbox sorting
        `CREATE INDEX IF NOT EXISTS contact_messages_status_created_idx ON contact_messages (status, created_at DESC);`,
        // 3. Index on forms.type for separating feedback forms from general forms
        `CREATE INDEX IF NOT EXISTS forms_type_idx ON forms (type);`,
        // 4. Index on forms.slug for instant lookup
        `CREATE INDEX IF NOT EXISTS forms_slug_idx ON forms (slug);`,
        // 5. Index on form_responses (form_id, created_at DESC)
        `CREATE INDEX IF NOT EXISTS form_responses_form_created_idx ON form_responses (form_id, created_at DESC);`
    ];

    for (const sql of statements) {
        try {
            await pool.query(sql);
            console.log('✓ Executed:', sql.trim());
        } catch (err) {
            console.error('✗ Failed on:', sql.trim(), err.message);
        }
    }

    console.log('--- Optimization Complete ---');
    await pool.end();
}

main();
