const { sequelize, Decision } = require('./src/models');

async function listIds() {
    try {
        await sequelize.authenticate();

        const decisions = await Decision.findAll({
            attributes: ['id', 'title'],
            order: [['created_at', 'ASC']]
        });

        console.log('Current Decision IDs:\n');
        decisions.forEach(d => {
            console.log(`${d.id} - ${d.title}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listIds();
