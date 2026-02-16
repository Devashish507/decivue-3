const { sequelize, Decision } = require('./src/models');

async function printUrls() {
    try {
        await sequelize.authenticate();

        const decisions = await Decision.findAll({
            attributes: ['id', 'title'],
            order: [['created_at', 'ASC']]
        });

        console.log('\n=== Valid Decision Detail URLs ===\n');
        decisions.forEach(d => {
            console.log(`${d.title}:`);
            console.log(`  http://localhost:5174/decisions/${d.id}\n`);
        });

        console.log('=== Copy any URL above and paste in your browser ===\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

printUrls();
