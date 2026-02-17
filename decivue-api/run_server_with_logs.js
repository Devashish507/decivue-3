const app = require('./app');
const { sequelize } = require('./src/models');
const fs = require('fs');

const logFile = 'server_startup.log';
const log = (msg) => {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`);
    console.log(msg);
};

fs.writeFileSync(logFile, 'Starting custom server script...\n');

const PORT = 3000;

async function startServer() {
    try {
        log('Attempting to authenticate sequelize...');
        await sequelize.authenticate();
        log('Database connected successfully.');

        log('Syncing models...');
        await sequelize.sync({ alter: true });
        log('Models synced.');

        app.listen(PORT, () => {
            log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        log('Unable to connect to the database: ' + error.message);
        log(error.stack);
        process.exit(1);
    }
}

startServer();
