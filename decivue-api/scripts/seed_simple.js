const { Decision, sequelize } = require('../src/models');

async function seedSimple() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Syncing...');
        await sequelize.sync({ force: true });
        console.log('Synced.');

        console.log('Creating decision...');
        const decision = await Decision.create({
            title: 'Simple Test Decision',
            context: 'Testing DB write',
            decision_type: 'strategic',
            lifecycle_state: 'Active',
            owner_id: 'test-user'
        });
        console.log(`Created decision: ${decision.id}`);

    } catch (err) {
        console.error('Seed Error:', err);
    } finally {
        await sequelize.close();
    }
}

seedSimple();
