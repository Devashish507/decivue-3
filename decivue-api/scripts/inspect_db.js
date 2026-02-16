const { Decision, sequelize } = require('../src/models');

async function inspectDB() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const total = await Decision.count();
        console.log(`Total Decisions: ${total}`);

        const decisions = await Decision.findAll({
            include: [{ model: Decision, as: 'children' }]
        });

        decisions.forEach(d => {
            console.log(`ID: ${d.id} | Title: ${d.title} | Parent: ${d.parent_id} | Children Count: ${d.children?.length || 0}`);
        });

    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        await sequelize.close();
    }
}

inspectDB();
