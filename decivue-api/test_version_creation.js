const { sequelize, DecisionVersion } = require('./src/models');

async function testVersionCreation() {
    try {
        await sequelize.authenticate();
        console.log('Connected.\n');

        // Try to create a test version with snapshot_json
        const testData = {
            title: 'Test Decision',
            context: 'Test Context',
            current_confidence: 50
        };

        const testSnapshot = JSON.stringify(testData);
        console.log('Test snapshot string:', testSnapshot);
        console.log('Test snapshot length:', testSnapshot.length);

        const newVersion = await DecisionVersion.create({
            decision_id: '00000000-0000-0000-0000-000000000000', // Fake ID for test
            version_number: 999,
            snapshot_json: testSnapshot,
            changed_fields_json: JSON.stringify({ test: 'change' }),
            confidence_before: 50,
            confidence_after: 50,
            created_by: 'TEST'
        });

        console.log('\n✅ Test version created with ID:', newVersion.id);
        console.log('Saved snapshot_json type:', typeof newVersion.snapshot_json);
        console.log('Saved snapshot_json value:', newVersion.snapshot_json);

        // Now read it back
        const retrieved = await DecisionVersion.findByPk(newVersion.id);
        console.log('\n📖 Retrieved version:');
        console.log('snapshot_json type:', typeof retrieved.snapshot_json);
        console.log('snapshot_json value:', retrieved.snapshot_json);
        console.log('getDataValue result:', retrieved.getDataValue('snapshot_json'));

        // Clean up
        await retrieved.destroy();
        console.log('\n🗑️  Test version deleted');

        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

testVersionCreation();
