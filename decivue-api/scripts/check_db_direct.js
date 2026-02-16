const { Decision, sequelize } = require('../src/models');

async function checkDb() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const count = await Decision.count();
        console.log(`Decision Count: ${count}`);

        if (count > 0) {
            const first = await Decision.findOne();
            console.log('First Decision:', first.title);
        }

    } catch (err) {
        console.error('DB Check Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkDb();
