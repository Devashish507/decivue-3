const { sequelize } = require('./src/models');

async function checkLatestVersion() {
    try {
        await sequelize.authenticate();
        console.log('Connected.\n');

        const [results] = await sequelize.query(`
            SELECT id, version_number, decision_id, 
                   snapshot_json, changed_fields_json,
                   created_by, created_at
            FROM DecisionVersions 
            ORDER BY created_at DESC 
            LIMIT 3;
        `);

        console.log('=== Latest 3 Versions ===\n');
        results.forEach((row, idx) => {
            console.log(`\n--- Version ${idx + 1} ---`);
            console.log(`ID: ${row.id}`);
            console.log(`Version Number: ${row.version_number}`);
            console.log(`Created By: ${row.created_by}`);
            console.log(`Created At: ${row.created_at}`);
            console.log(`\nsnapshot_json IS NULL: ${row.snapshot_json === null}`);
            console.log(`snapshot_json type: ${typeof row.snapshot_json}`);

            if (row.snapshot_json) {
                const preview = JSON.stringify(row.snapshot_json).substring(0, 200);
                console.log(`snapshot_json preview: ${preview}...`);
            } else {
                console.log(`snapshot_json value: NULL`);
            }

            console.log(`\nchanged_fields_json IS NULL: ${row.changed_fields_json === null}`);
            if (row.changed_fields_json) {
                console.log(`changed_fields_json: ${JSON.stringify(row.changed_fields_json)}`);
            }
        });

        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkLatestVersion();
