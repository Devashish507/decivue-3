const { sequelize } = require('./src/models');

async function clearDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Disabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Truncating tables...');
        await sequelize.query('TRUNCATE TABLE `DecisionHistories`');
        await sequelize.query('TRUNCATE TABLE `DecisionRelations`');
        await sequelize.query('TRUNCATE TABLE `Assumptions`');
        await sequelize.query('TRUNCATE TABLE `Decisions`');

        console.log('Re-enabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Database cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearDatabase();
