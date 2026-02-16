const { sequelize, Decision, Assumption, DecisionRelation, DecisionHistory } = require('./src/models');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync to ensure tables exist (alt to migration for this rescue script)
        // await sequelize.sync({ force: true }); 

        const rootId = uuidv4();
        const child1Id = uuidv4();
        const child1_Sub1Id = uuidv4();
        const child1_Sub2Id = uuidv4();
        const child2Id = uuidv4();
        const child3Id = uuidv4();
        const staleId = uuidv4();

        const now = new Date();

        console.log('Seeding Decisions...');
        await Decision.bulkCreate([
            {
                id: rootId,
                title: 'Organize Annual Tech Conference 2026',
                context: 'Company wants to host large technology conference for marketing and partnerships.',
                initial_confidence: 85,
                current_confidence: 85,
                risk_level: 'Medium',
                impact_level: 'High',
                lifecycle_state: 'Active',
                parent_decision_id: null,
                created_at: now,
                updated_at: now,
                last_reviewed_at: now
            },
            {
                id: child1Id,
                title: 'Select Event Venue',
                context: 'Choosing the right location is critical for capacity and logistics.',
                initial_confidence: 80,
                current_confidence: 80,
                risk_level: 'High',
                impact_level: 'High',
                lifecycle_state: 'Active',
                parent_decision_id: rootId,
                created_at: now,
                updated_at: now,
                last_reviewed_at: now
            },
            {
                id: child1_Sub1Id,
                title: 'Finalize Pune Convention Center',
                context: 'Local option, good logistics.',
                initial_confidence: 75,
                current_confidence: 75,
                risk_level: 'Low',
                impact_level: 'Medium',
                lifecycle_state: 'Active',
                parent_decision_id: child1Id,
                created_at: now,
                updated_at: now,
                last_reviewed_at: now
            },
            {
                id: child1_Sub2Id,
                title: 'Consider Mumbai Exhibition Hall',
                context: 'Better reach, higher cost.',
                initial_confidence: 60,
                current_confidence: 60,
                risk_level: 'High',
                impact_level: 'High',
                lifecycle_state: 'Active', // Mapped 'At Risk' to Active for simplicity + flags
                parent_decision_id: child1Id,
                created_at: now,
                updated_at: now,
                last_reviewed_at: now
            },
            {
                id: child2Id,
                title: 'Choose Event Technology Platform',
                context: 'Need robust streaming.',
                initial_confidence: 78,
                current_confidence: 78,
                risk_level: 'Medium',
                impact_level: 'Medium',
                lifecycle_state: 'Active',
                parent_decision_id: rootId,
                created_at: now,
                updated_at: now,
                last_reviewed_at: now
            },
            {
                id: child3Id,
                title: 'Marketing Strategy',
                context: 'Reach target audience.',
                initial_confidence: 88,
                current_confidence: 88,
                risk_level: 'Medium',
                impact_level: 'High',
                lifecycle_state: 'Active',
                parent_decision_id: rootId,
                created_at: now,
                updated_at: now,
                last_reviewed_at: now
            },
            {
                id: staleId,
                title: 'Partner With Influencer Network',
                context: 'Boost reach via influencers.',
                initial_confidence: 45,
                current_confidence: 45,
                risk_level: 'High',
                impact_level: 'Medium',
                lifecycle_state: 'Stale',
                parent_decision_id: child3Id,
                created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
                updated_at: now,
                last_reviewed_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log('Seeding Assumptions...');
        await Assumption.bulkCreate([
            { id: uuidv4(), decision_id: child1Id, assumption_text: 'Venue available in March', is_active: true, created_at: now, updated_at: now },
            { id: uuidv4(), decision_id: child1Id, assumption_text: 'Budget approved', is_active: true, created_at: now, updated_at: now },
            { id: uuidv4(), decision_id: child1_Sub1Id, assumption_text: 'Vendor quotation confirmed', is_active: true, created_at: now, updated_at: now },
            { id: uuidv4(), decision_id: child1_Sub2Id, assumption_text: 'Higher travel cost acceptable', is_active: true, created_at: now, updated_at: now },
            { id: uuidv4(), decision_id: staleId, assumption_text: 'Influencer contracts signed', is_active: true, created_at: now, updated_at: now }
        ]);

        console.log('Seeding Relations...');
        await DecisionRelation.bulkCreate([
            {
                id: uuidv4(),
                source_decision_id: child1_Sub1Id,
                target_decision_id: child1_Sub2Id,
                relation_type: 'conflict',
                notes: 'Both venues compete for same event scheduling and budget allocation.',
                created_at: now,
                updated_at: now
            }
        ]);

        console.log('Seeding History...');
        await DecisionHistory.bulkCreate([
            {
                id: uuidv4(),
                decision_id: rootId,
                event_type: 'CREATED',
                description: 'Root decision created',
                created_at: now,
                updated_at: now
            }
        ]);

        console.log('Seeding Completed Successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
}

seed();
