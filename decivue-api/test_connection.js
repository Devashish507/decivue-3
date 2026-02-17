const { sequelize } = require('./src/models');
const fs = require('fs');

async function test() {
    try {
        await sequelize.authenticate();
        fs.writeFileSync('connection_success.txt', 'Connection successful at ' + new Date().toISOString());
        console.log('Success');
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('connection_error.txt', e.message + '\n' + e.stack);
        console.error('Failure', e);
        process.exit(1);
    }
}
test();
