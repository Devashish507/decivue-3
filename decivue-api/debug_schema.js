const { Sequelize } = require('sequelize');
const config = require('./src/config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect
});

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const [results, metadata] = await sequelize.query("DESCRIBE Decisions;");
        console.log('Decisions Table Schema:', results);

        await sequelize.close();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

checkSchema();
