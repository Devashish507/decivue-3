const { sequelize } = require('./src/models');

async function fixColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Add columns one at a time to avoid deadlock
        try {
            await sequelize.query('ALTER TABLE DecisionVersions ADD COLUMN snapshot_json JSON NULL;');
            console.log('✅ Added snapshot_json column');
        } catch (e) {
            if (e.message.includes('Duplicate column')) {
                console.log('⚠️  snapshot_json already exists');
            } else {
                console.error('❌ Error adding snapshot_json:', e.message);
            }
        }

        try {
            await sequelize.query('ALTER TABLE DecisionVersions ADD COLUMN changed_fields_json JSON NULL;');
            console.log('✅ Added changed_fields_json column');
        } catch (e) {
            if (e.message.includes('Duplicate column')) {
                console.log('⚠️  changed_fields_json already exists');
            } else {
                console.error('❌ Error adding changed_fields_json:', e.message);
            }
        }

        console.log('\n✅ Done! Restart the server now.');
        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Fatal error:', err);
        process.exit(1);
    }
}

fixColumns();
