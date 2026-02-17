const { sequelize, Decision } = require('./src/models');
const fs = require('fs');

async function verify() {
    try {
        await sequelize.authenticate();
        const decisions = await Decision.findAll({ attributes: ['id', 'title'], limit: 20 });
        const result = decisions.map(d => `${d.id}: ${d.title}`).join('\n');
        fs.writeFileSync('db_ids.txt', result || 'No decisions found');
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('db_ids_error.txt', e.message);
        process.exit(1);
    }
}
verify();
