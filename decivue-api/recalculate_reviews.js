require('dotenv').config();
const { Decision } = require('./src/models');
const reviewIntelligenceService = require('./src/services/reviewIntelligenceService');

async function recalculateAll() {
    console.log('🔄 Recalculating review intelligence for all decisions...\n');

    try {
        const decisions = await Decision.findAll();
        console.log(`Found ${decisions.length} decisions\n`);

        for (const decision of decisions) {
            try {
                const result = await reviewIntelligenceService.updateReviewIntelligence(decision.id);
                console.log(`✅ ${decision.title}`);
                console.log(`   Score: ${result.score}, Next Review: ${result.nextReviewDate.toLocaleDateString()}, Escalation: ${result.escalationLevel || 'None'}\n`);
            } catch (error) {
                console.error(`❌ Error updating ${decision.title}:`, error.message);
            }
        }

        console.log('\n✨ Recalculation complete!');
        console.log('\n🧪 Test the alerts endpoint:');
        console.log('   curl.exe http://localhost:3000/api/decisions/alerts\n');

        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

recalculateAll();
