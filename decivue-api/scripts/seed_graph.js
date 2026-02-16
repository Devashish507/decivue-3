const { Decision, DecisionNode, DecisionEdge, DecisionRelation, sequelize } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

async function seedGraph() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 0. Clean & Sync Database
        console.log('Syncing database (force: true)...');
        // This drops all tables and recreates them based on models
        await sequelize.sync({ force: true });
        console.log('Database synced and cleaned.');

        // 1. Create Main Strategic Decision
        console.log('Creating Main Strategy Decision...');
        const mainDecision = await Decision.create({
            title: 'Adopt Enterprise AI Platform',
            context: 'We need to modernize our tech stack to support generative AI workflows across the organization.',
            decision_type: 'strategic',
            lifecycle_state: 'Active',
            initial_confidence: 75,
            current_confidence: 80,
            risk_level: 'High',
            impact_level: 'High',
            owner_id: 'user-1',
            // Timeline: Started 30 days ago, Target is 60 days from now
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            expected_duration_days: 90,
            health_score: 85, // Good
            last_review_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Reviewed 5 days ago
        });

        // Add Progress History for Graph
        await require('../src/models').DecisionProgressHistory.bulkCreate([
            { decision_id: mainDecision.id, recorded_progress: 0, recorded_confidence: 75, recorded_health: 100, recorded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            { decision_id: mainDecision.id, recorded_progress: 10, recorded_confidence: 76, recorded_health: 95, recorded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
            { decision_id: mainDecision.id, recorded_progress: 20, recorded_confidence: 78, recorded_health: 90, recorded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
            { decision_id: mainDecision.id, recorded_progress: 24, recorded_confidence: 80, recorded_health: 85, recorded_at: new Date() }
        ]);

        // Add Review
        await require('../src/models').DecisionReview.create({
            decision_id: mainDecision.id,
            review_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: 'Completed',
            notes: 'Initial progress looks good, but hiring is lagging.'
        });

        // 1a. Create Nodes for Main Decision
        const mainGoal = await DecisionNode.create({
            decision_id: mainDecision.id,
            node_type: 'goal',
            content: 'Select and implement a scalable AI platform by Q4',
            parent_node_id: null
        });

        const mainOption1 = await DecisionNode.create({
            decision_id: mainDecision.id,
            node_type: 'option',
            content: 'Build Internal Platform',
            parent_node_id: mainGoal.id
        });

        const mainOption2 = await DecisionNode.create({
            decision_id: mainDecision.id,
            node_type: 'option',
            content: 'Buy Vendor Solution (SaaS)',
            parent_node_id: mainGoal.id
        });

        const mainRisk = await DecisionNode.create({
            decision_id: mainDecision.id,
            node_type: 'risk',
            content: 'High initial cost and training overhead',
            parent_node_id: mainOption1.id
        });

        // 2. Create Sub-Decision 1 (Operational)
        console.log('Creating Sub-Decision 1 (Cloud Provider)...');
        const sub1 = await Decision.create({
            title: 'Select Cloud Infrastructure Provider',
            context: 'Which cloud provider offers the best GPU availability for our AI workloads?',
            decision_type: 'operational',
            lifecycle_state: 'Active',
            initial_confidence: 60,
            current_confidence: 65,
            risk_level: 'Medium',
            impact_level: 'High',
            parent_id: mainDecision.id, // Hierarchy Link
            start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            target_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Due in 10 days
            health_score: 90
        });
        console.log(`Sub 1 Created: ${sub1.id}`);

        // Track Sub 1
        console.log('Tracking Sub 1...');
        await require('../src/models').SubDecisionTracking.create({
            sub_decision_id: sub1.id,
            status: 'In Progress',
            weight: 1.5,
            completion_percentage: 40
        });
        console.log('Sub 1 Tracked.');

        // 2a. Nodes for Sub 1
        await DecisionNode.create({
            decision_id: sub1.id,
            node_type: 'goal',
            content: 'Secure cost-effective GPU compute',
            parent_node_id: null
        });

        // 3. Create Sub-Decision 2 (Support) - BEHIND SCHEDULE
        console.log('Creating Sub-Decision 2 (Hiring)...');
        const sub2 = await Decision.create({
            title: 'AI Engineering Hiring Plan',
            context: 'We need to hire 5 AI engineers to support the new platform.',
            decision_type: 'support',
            lifecycle_state: 'Active',
            initial_confidence: 90,
            current_confidence: 60, // Dropped
            risk_level: 'Low',
            impact_level: 'Medium',
            parent_id: mainDecision.id, // Hierarchy Link
            start_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // Started 40 days ago
            target_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // OVERDUE by 5 days
            health_score: 45 // At Risk
        });
        console.log(`Sub 2 Created: ${sub2.id}`);

        // Track Sub 2
        console.log('Tracking Sub 2...');
        await require('../src/models').SubDecisionTracking.create({
            sub_decision_id: sub2.id,
            status: 'Stalled',
            weight: 1.0,
            completion_percentage: 10
        });
        console.log('Sub 2 Tracked.');

        // Add Overdue Review
        console.log('Adding Review...');
        await require('../src/models').DecisionReview.create({
            decision_id: sub2.id,
            review_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status: 'Overdue',
            notes: 'HR validation pending.'
        });

        // Update Main Decision Progress (Simulate calculation: (40*1.5 + 10*1) / 2.5 = 28%)
        await mainDecision.update({
            progress_percentage: 28,
            current_confidence: 72
        });

        // 4. Create Relationships (Peer Links)
        console.log('Creating Relationships...');

        await DecisionRelation.create({
            source_decision_id: sub1.id,
            target_decision_id: mainDecision.id,
            relation_type: 'SUPPORTS',
            notes: 'Cloud choice enables the platform strategy'
        });

        await DecisionRelation.create({
            source_decision_id: sub2.id,
            target_decision_id: mainDecision.id,
            relation_type: 'DERIVED_FROM', // Explicit link
            notes: 'Hiring is required for the platform'
        });

        console.log('Seed Completed Successfully!');

    } catch (error) {
        console.error('Seed Failed:', error);
    } finally {
        // await sequelize.close(); // Keep open if running in app context, but for script close it.
        // process.exit();
    }
}

seedGraph();
