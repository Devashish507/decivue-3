const { sequelize, Decision } = require('./src/models');

async function checkDuplicates() {
    try {
        await sequelize.authenticate();

        const decisions = await Decision.findAll({
            attributes: ['id', 'title', 'parent_decision_id', 'current_confidence'],
            order: [['created_at', 'ASC']]
        });

        console.log(`Total decisions: ${decisions.length}\n`);

        const titleCounts = {};
        decisions.forEach(d => {
            const title = d.title;
            titleCounts[title] = (titleCounts[title] || 0) + 1;
        });

        console.log('Duplicate titles:');
        Object.entries(titleCounts).forEach(([title, count]) => {
            if (count > 1) {
                console.log(`  "${title}": ${count} instances`);
            }
        });

        console.log('\nAll decisions:');
        decisions.forEach(d => {
            console.log(`- ${d.title} (conf: ${d.current_confidence}, parent: ${d.parent_decision_id || 'ROOT'})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDuplicates();
