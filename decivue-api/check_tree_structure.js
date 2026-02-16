const { Decision } = require('./src/models');

async function checkTreeStructure() {
    try {
        console.log('Checking tree structure in database...\n');

        const decisions = await Decision.findAll({
            attributes: ['id', 'title', 'parent_decision_id'],
            order: [['created_at', 'ASC']]
        });

        console.log(`Total decisions: ${decisions.length}\n`);

        const roots = decisions.filter(d => !d.parent_decision_id);
        const children = decisions.filter(d => d.parent_decision_id);

        console.log(`Root decisions (no parent): ${roots.length}`);
        roots.forEach(d => {
            console.log(`  - "${d.title}" (ID: ${d.id})`);
        });

        console.log(`\nChild decisions (have parent): ${children.length}`);
        children.forEach(d => {
            const parent = decisions.find(p => p.id === d.parent_decision_id);
            console.log(`  - "${d.title}" (ID: ${d.id})`);
            console.log(`    Parent: "${parent?.title || 'NOT FOUND'}" (ID: ${d.parent_decision_id})`);
        });

        // Check for orphaned children
        const orphans = children.filter(d => !decisions.find(p => p.id === d.parent_decision_id));
        if (orphans.length > 0) {
            console.log(`\n⚠️  Orphaned children (parent doesn't exist): ${orphans.length}`);
            orphans.forEach(d => {
                console.log(`  - "${d.title}" references parent ID: ${d.parent_decision_id}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTreeStructure();
