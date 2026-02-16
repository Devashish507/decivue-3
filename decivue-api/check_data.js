const { sequelize } = require('./src/models');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.\n');

        const [results] = await sequelize.query('SELECT * FROM DecisionVersions ORDER BY created_at DESC LIMIT 5;');

        console.log('=== Recent DecisionVersions Records ===\n');
        results.forEach((row, idx) => {
            console.log(`Record ${idx + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Version: ${row.version_number}`);
            console.log(`  snapshot_json: ${row.snapshot_json === null ? 'NULL' : typeof row.snapshot_json}`);
            console.log(`  snapshot_json value: ${JSON.stringify(row.snapshot_json)?.substring(0, 100)}`);
            console.log(`  changed_fields_json: ${row.changed_fields_json === null ? 'NULL' : typeof row.changed_fields_json}`);
            console.log('');
        });

        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkData();
