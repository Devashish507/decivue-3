const { Decision, Assumption, DecisionHistory } = require('./src/models');

async function checkDecisions() {
    try {
        console.log('Fetching all decisions from database...\n');

        const decisions = await Decision.findAll({
            include: [
                { model: Assumption, as: 'assumptions' },
                { model: DecisionHistory, as: 'history' }
            ]
        });

        console.log(`Found ${decisions.length} decisions\n`);

        decisions.forEach((decision, index) => {
            console.log(`${index + 1}. "${decision.title}"`);
            console.log(`   ID: ${decision.id}`);
            console.log(`   Context: ${decision.context ? 'Yes' : 'NO - MISSING'}`);
            console.log(`   Current Confidence: ${decision.current_confidence !== null ? decision.current_confidence : 'NO - MISSING'}`);
            console.log(`   Risk Level: ${decision.risk_level || 'NO - MISSING'}`);
            console.log(`   Impact Level: ${decision.impact_level || 'NO - MISSING'}`);
            console.log(`   Lifecycle State: ${decision.lifecycle_state || 'NO - MISSING'}`);
            console.log(`   Assumptions: ${decision.assumptions?.length || 0}`);
            console.log(`   History: ${decision.history?.length || 0}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDecisions();
