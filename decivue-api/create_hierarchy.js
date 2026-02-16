const { Decision } = require('./src/models');

async function createSampleHierarchy() {
    try {
        console.log('Creating sample decision hierarchy...\n');

        // Get all decisions
        const decisions = await Decision.findAll({
            order: [['created_at', 'ASC']]
        });

        if (decisions.length < 3) {
            console.log('Need at least 3 decisions to create hierarchy');
            process.exit(1);
        }

        // Create a simple hierarchy:
        // Decision 1 (root)
        //   ├─ Decision 2 (child of 1)
        //   └─ Decision 3 (child of 1)
        // Decision 4 (root)
        //   └─ Decision 5 (child of 4)

        console.log('Setting up hierarchy:\n');

        // Make decision 2 a child of decision 1
        await decisions[1].update({ parent_decision_id: decisions[0].id });
        console.log(`✅ "${decisions[1].title}" is now a child of "${decisions[0].title}"`);

        // Make decision 3 a child of decision 1
        if (decisions[2]) {
            await decisions[2].update({ parent_decision_id: decisions[0].id });
            console.log(`✅ "${decisions[2].title}" is now a child of "${decisions[0].title}"`);
        }

        // Make decision 5 a child of decision 4
        if (decisions[4] && decisions[3]) {
            await decisions[4].update({ parent_decision_id: decisions[3].id });
            console.log(`✅ "${decisions[4].title}" is now a child of "${decisions[3].title}"`);
        }

        console.log('\n✅ Sample hierarchy created!');
        console.log('\nTree structure:');
        console.log(`├─ ${decisions[0].title} (ROOT)`);
        console.log(`│  ├─ ${decisions[1].title}`);
        if (decisions[2]) console.log(`│  └─ ${decisions[2].title}`);
        if (decisions[3] && decisions[4]) {
            console.log(`├─ ${decisions[3].title} (ROOT)`);
            console.log(`│  └─ ${decisions[4].title}`);
        }
        console.log('\nRefresh your browser to see the tree with arrows!');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createSampleHierarchy();
