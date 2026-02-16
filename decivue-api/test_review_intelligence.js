const { Decision, DecisionRelation, Assumption, sequelize } = require('./src/models');
const reviewIntelligenceService = require('./src/services/reviewIntelligenceService');

async function seedReviewTestData() {
    console.log('🔬 Creating test decisions for Review Intelligence...\n');

    try {
        // 1. HIGH URGENCY - Critical Risk with Conflicts (should score 80+)
        console.log('1️⃣ Creating CRITICAL decision with conflicts...');
        const critical = await Decision.create({
            title: 'Critical Infrastructure Migration',
            context: 'Moving to new cloud provider',
            decision_type: 'MAIN_STRATEGIC',
            priority_level: 'CRITICAL',
            impact_level: 'Critical',
            risk_level: 'Critical',
            initial_confidence: 80,
            current_confidence: 60, // 20% drop
            lifecycle_state: 'Active'
        });

        // Add assumptions (old ones)
        await Assumption.create({
            decision_id: critical.id,
            assumption_text: 'Budget approved',
            validity_status: 'VALID',
            created_at: new Date('2023-10-01') // Very old
        });

        await Assumption.create({
            decision_id: critical.id,
            assumption_text: 'Team has capacity',
            validity_status: 'VALID',
            created_at: new Date('2023-11-01') // Old
        });

        // Calculate score
        await reviewIntelligenceService.updateReviewIntelligence(critical.id);
        const updated1 = await Decision.findByPk(critical.id);
        console.log(`   ✅ Score: ${updated1.review_urgency_score}, Next Review: ${updated1.next_review_date}`);

        // 2. MEDIUM-HIGH URGENCY - High Impact with some issues (should score 60-79)
        console.log('\n2️⃣ Creating HIGH impact decision...');
        const highImpact = await Decision.create({
            title: 'Customer Data Privacy Policy Update',
            context: 'GDPR compliance changes',
            decision_type: 'MAIN_STRATEGIC',
            priority_level: 'HIGH',
            impact_level: 'High',
            risk_level: 'High',
            initial_confidence: 70,
            current_confidence: 68,
            lifecycle_state: 'Active'
        });

        await Assumption.create({
            decision_id: highImpact.id,
            assumption_text: 'Legal team reviewed',
            validity_status: 'VALID'
        });

        await reviewIntelligenceService.updateReviewIntelligence(highImpact.id);
        const updated2 = await Decision.findByPk(highImpact.id);
        console.log(`   ✅ Score: ${updated2.review_urgency_score}, Next Review: ${updated2.next_review_date}`);

        // 3. OVERDUE DECISION - Manually set past review date
        console.log('\n3️⃣ Creating OVERDUE decision...');
        const overdue = await Decision.create({
            title: 'Legacy System Decommission',
            context: 'Remove old payment gateway',
            decision_type: 'MAIN_STRATEGIC',
            priority_level: 'MEDIUM',
            impact_level: 'Medium',
            risk_level: 'Medium',
            initial_confidence: 60,
            current_confidence: 55,
            lifecycle_state: 'Active',
            next_review_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        });

        await reviewIntelligenceService.updateReviewIntelligence(overdue.id);
        const updated3 = await Decision.findByPk(overdue.id);
        console.log(`   ✅ Score: ${updated3.review_urgency_score}, Escalation: ${updated3.review_escalation_level}`);

        // 4. LOW URGENCY - Everything looks good
        console.log('\n4️⃣ Creating LOW urgency decision...');
        const lowRisk = await Decision.create({
            title: 'Office Snack Selection',
            context: 'Choose new snack vendors',
            decision_type: 'SUPPORTING',
            priority_level: 'LOW',
            impact_level: 'Low',
            risk_level: 'Low',
            initial_confidence: 90,
            current_confidence: 90,
            lifecycle_state: 'Active'
        });

        await reviewIntelligenceService.updateReviewIntelligence(lowRisk.id);
        const updated4 = await Decision.findByPk(lowRisk.id);
        console.log(`   ✅ Score: ${updated4.review_urgency_score}, Next Review: ${updated4.next_review_date}`);

        // 5. CONFIDENCE DROP - Big confidence decline
        console.log('\n5️⃣ Creating decision with MAJOR confidence drop...');
        const confidenceDrop = await Decision.create({
            title: 'AI Model Deployment Strategy',
            context: 'Deploy new ML models to production',
            decision_type: 'MAIN_STRATEGIC',
            priority_level: 'HIGH',
            impact_level: 'High',
            risk_level: 'Medium',
            initial_confidence: 85,
            current_confidence: 50, // 35% drop!
            lifecycle_state: 'Active'
        });

        await reviewIntelligenceService.updateReviewIntelligence(confidenceDrop.id);
        const updated5 = await Decision.findByPk(confidenceDrop.id);
        console.log(`   ✅ Score: ${updated5.review_urgency_score}, Next Review: ${updated5.next_review_date}`);

        console.log('\n✨ Test data created successfully!\n');
        console.log('📊 Summary:');
        console.log('   - Critical (80+ score): Should review in 3 days');
        console.log('   - High Priority (60-79): Should review in 7 days');
        console.log('   - Overdue: Should have escalation level');
        console.log('   - Low Priority: Should review in 30 days');
        console.log('\n🧪 Test the API:');
        console.log('   GET http://localhost:3000/api/decisions/alerts\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        process.exit(0);
    }
}

seedReviewTestData();
