const { sequelize } = require('./src/models');
const { Decision, DecisionRelation, Assumption, DecisionHistory } = require('./src/models');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seed...\n');

        // Clear existing data
        console.log('Clearing existing data...');
        await DecisionRelation.destroy({ where: {} });
        await Assumption.destroy({ where: {} });
        await DecisionHistory.destroy({ where: {} });
        await Decision.destroy({ where: {} });

        // Create main decisions
        console.log('\n📊 Creating main decisions...\n');

        const decision1 = await Decision.create({
            title: 'Migrate to Microservices Architecture',
            context: 'Our monolithic application is becoming difficult to scale and maintain. We need to evaluate moving to a microservices architecture to improve scalability, enable independent deployments, and allow teams to work more autonomously.',
            initial_confidence: 75,
            current_confidence: 72,
            risk_level: 'High',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision1.title}`);

        const decision2 = await Decision.create({
            title: 'Adopt Kubernetes for Container Orchestration',
            context: 'To support our microservices architecture, we need a robust container orchestration platform. Kubernetes is the industry standard and provides excellent scalability, self-healing, and deployment automation.',
            initial_confidence: 85,
            current_confidence: 85,
            risk_level: 'Medium',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision2.title}`);

        const decision3 = await Decision.create({
            title: 'Implement API Gateway Pattern',
            context: 'With multiple microservices, we need a unified entry point for client requests. An API Gateway will handle routing, authentication, rate limiting, and provide a single point of entry for our services.',
            initial_confidence: 80,
            current_confidence: 78,
            risk_level: 'Medium',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision3.title}`);

        const decision4 = await Decision.create({
            title: 'Use PostgreSQL for Primary Database',
            context: 'We need a reliable, ACID-compliant relational database for our core business data. PostgreSQL offers excellent performance, robust features, and strong community support.',
            initial_confidence: 90,
            current_confidence: 88,
            risk_level: 'Low',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision4.title}`);

        const decision5 = await Decision.create({
            title: 'Implement Event-Driven Architecture with Kafka',
            context: 'To enable loose coupling between microservices and handle high-throughput data streams, we will use Apache Kafka for event-driven communication and real-time data processing.',
            initial_confidence: 70,
            current_confidence: 65,
            risk_level: 'High',
            impact_level: 'Medium',
            lifecycle_state: 'Draft',
            last_reviewed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision5.title}`);

        const decision6 = await Decision.create({
            title: 'Adopt React for Frontend Development',
            context: 'We need a modern, component-based frontend framework. React provides excellent developer experience, strong ecosystem, and is widely adopted in the industry.',
            initial_confidence: 88,
            current_confidence: 90,
            risk_level: 'Low',
            impact_level: 'Medium',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision6.title}`);

        const decision7 = await Decision.create({
            title: 'Implement CI/CD Pipeline with GitHub Actions',
            context: 'Automated testing and deployment are critical for our development workflow. GitHub Actions integrates seamlessly with our repository and provides flexible automation capabilities.',
            initial_confidence: 82,
            current_confidence: 85,
            risk_level: 'Low',
            impact_level: 'Medium',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision7.title}`);

        const decision8 = await Decision.create({
            title: 'Use Redis for Caching Layer',
            context: 'To improve application performance and reduce database load, we will implement Redis as our primary caching solution for frequently accessed data.',
            initial_confidence: 85,
            current_confidence: 83,
            risk_level: 'Low',
            impact_level: 'Medium',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Created: ${decision8.title}`);

        // Create sub-decisions (at least 2 for each main decision)
        console.log('\n📊 Creating sub-decisions...\n');

        // Microservices sub-decisions
        const sub1_1 = await Decision.create({
            title: 'Choose Service Mesh (Istio vs Linkerd)',
            context: 'Select service mesh for microservices communication, observability, and security.',
            initial_confidence: 60, current_confidence: 60, risk_level: 'Medium', impact_level: 'Medium',
            lifecycle_state: 'Draft', last_reviewed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000)
        });
        const sub1_2 = await Decision.create({
            title: 'Define Microservice Boundaries',
            context: 'Establish clear boundaries for each microservice based on domain-driven design.',
            initial_confidence: 70, current_confidence: 68, risk_level: 'High', impact_level: 'High',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000)
        });

        // Kubernetes sub-decisions
        const sub2_1 = await Decision.create({
            title: 'Select Kubernetes Distribution (EKS vs GKE vs AKS)',
            context: 'Choose managed Kubernetes service based on cloud strategy and requirements.',
            initial_confidence: 75, current_confidence: 75, risk_level: 'Medium', impact_level: 'High',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
        });
        const sub2_2 = await Decision.create({
            title: 'Configure Kubernetes Networking (Calico vs Cilium)',
            context: 'Select CNI plugin for Kubernetes networking and security policies.',
            initial_confidence: 65, current_confidence: 65, risk_level: 'Medium', impact_level: 'Medium',
            lifecycle_state: 'Draft', last_reviewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
        });

        // API Gateway sub-decisions
        const sub3_1 = await Decision.create({
            title: 'Choose API Gateway Technology (Kong vs Ambassador)',
            context: 'Select API Gateway implementation for performance and extensibility.',
            initial_confidence: 65, current_confidence: 65, risk_level: 'Medium', impact_level: 'Medium',
            lifecycle_state: 'Draft', last_reviewed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        });
        const sub3_2 = await Decision.create({
            title: 'Define API Rate Limiting Strategy',
            context: 'Establish rate limiting policies to protect backend services.',
            initial_confidence: 70, current_confidence: 72, risk_level: 'Low', impact_level: 'Medium',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000)
        });

        // PostgreSQL sub-decisions
        const sub4_1 = await Decision.create({
            title: 'Design Database Sharding Strategy',
            context: 'Plan horizontal partitioning for scalability as data grows.',
            initial_confidence: 55, current_confidence: 55, risk_level: 'High', impact_level: 'High',
            lifecycle_state: 'Draft', last_reviewed_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
        });
        const sub4_2 = await Decision.create({
            title: 'Configure PostgreSQL Replication',
            context: 'Set up streaming replication for high availability and read scaling.',
            initial_confidence: 80, current_confidence: 78, risk_level: 'Medium', impact_level: 'High',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000)
        });

        // Kafka sub-decisions
        const sub5_1 = await Decision.create({
            title: 'Define Kafka Topic Partitioning Strategy',
            context: 'Determine partitioning scheme for optimal throughput and ordering.',
            initial_confidence: 60, current_confidence: 58, risk_level: 'Medium', impact_level: 'Medium',
            lifecycle_state: 'Draft', last_reviewed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)
        });
        const sub5_2 = await Decision.create({
            title: 'Choose Kafka Schema Registry (Confluent vs Apicurio)',
            context: 'Select schema registry for managing event schemas and compatibility.',
            initial_confidence: 65, current_confidence: 65, risk_level: 'Low', impact_level: 'Medium',
            lifecycle_state: 'Draft', last_reviewed_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000)
        });

        // React sub-decisions
        const sub6_1 = await Decision.create({
            title: 'Select State Management Library (Redux vs Zustand)',
            context: 'Choose state management solution for complex application state.',
            initial_confidence: 75, current_confidence: 78, risk_level: 'Low', impact_level: 'Medium',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
        });
        const sub6_2 = await Decision.create({
            title: 'Choose UI Component Library (Material-UI vs Ant Design)',
            context: 'Select component library for consistent UI design system.',
            initial_confidence: 70, current_confidence: 72, risk_level: 'Low', impact_level: 'Low',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000)
        });

        // CI/CD sub-decisions
        const sub7_1 = await Decision.create({
            title: 'Define Deployment Strategy (Blue-Green vs Canary)',
            context: 'Choose deployment approach to minimize downtime and risk.',
            initial_confidence: 72, current_confidence: 75, risk_level: 'Medium', impact_level: 'Medium',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
        });
        const sub7_2 = await Decision.create({
            title: 'Configure Automated Testing Strategy',
            context: 'Define test coverage requirements and automation levels.',
            initial_confidence: 80, current_confidence: 82, risk_level: 'Low', impact_level: 'High',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
        });

        // Redis sub-decisions
        const sub8_1 = await Decision.create({
            title: 'Design Cache Invalidation Strategy',
            context: 'Define cache invalidation patterns to ensure data consistency.',
            initial_confidence: 68, current_confidence: 70, risk_level: 'Medium', impact_level: 'Medium',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
        });
        const sub8_2 = await Decision.create({
            title: 'Configure Redis Cluster for High Availability',
            context: 'Set up Redis clustering for fault tolerance and scalability.',
            initial_confidence: 75, current_confidence: 73, risk_level: 'Medium', impact_level: 'High',
            lifecycle_state: 'Active', last_reviewed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            review_due_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
        });

        console.log('✅ Created 16 sub-decisions (2 for each main decision)');

        // Create relationships
        console.log('\n🔗 Creating decision relationships...\n');

        // Sub-decision relationships
        const subDecisions = [
            [sub1_1, decision1], [sub1_2, decision1],
            [sub2_1, decision2], [sub2_2, decision2],
            [sub3_1, decision3], [sub3_2, decision3],
            [sub4_1, decision4], [sub4_2, decision4],
            [sub5_1, decision5], [sub5_2, decision5],
            [sub6_1, decision6], [sub6_2, decision6],
            [sub7_1, decision7], [sub7_2, decision7],
            [sub8_1, decision8], [sub8_2, decision8]
        ];

        for (const [sub, parent] of subDecisions) {
            await DecisionRelation.create({
                source_decision_id: sub.id,
                target_decision_id: parent.id,
                relation_type: 'SUB_DECISION',
                notes: `Sub-decision of ${parent.title}`
            });
        }
        console.log('✅ Created 16 SUB_DECISION relationships');

        // Main decision relationships
        await DecisionRelation.create({
            source_decision_id: decision2.id,
            target_decision_id: decision1.id,
            relation_type: 'DEPENDS_ON',
            notes: 'Kubernetes orchestrates the microservices'
        });

        await DecisionRelation.create({
            source_decision_id: decision3.id,
            target_decision_id: decision1.id,
            relation_type: 'DEPENDS_ON',
            notes: 'API Gateway provides entry point for microservices'
        });

        await DecisionRelation.create({
            source_decision_id: decision5.id,
            target_decision_id: decision1.id,
            relation_type: 'SUPPORTS',
            notes: 'Event-driven architecture enables loose coupling'
        });

        await DecisionRelation.create({
            source_decision_id: decision4.id,
            target_decision_id: decision1.id,
            relation_type: 'SUPPORTS',
            notes: 'PostgreSQL serves as primary data store'
        });

        await DecisionRelation.create({
            source_decision_id: decision8.id,
            target_decision_id: decision3.id,
            relation_type: 'SUPPORTS',
            notes: 'Redis caching improves API Gateway performance'
        });

        await DecisionRelation.create({
            source_decision_id: decision6.id,
            target_decision_id: decision3.id,
            relation_type: 'RELATES_TO',
            notes: 'React frontend communicates through API Gateway'
        });

        await DecisionRelation.create({
            source_decision_id: decision7.id,
            target_decision_id: decision2.id,
            relation_type: 'SUPPORTS',
            notes: 'CI/CD automates deployments to Kubernetes'
        });

        console.log('✅ Created 7 main decision relationships');

        // Create assumptions
        console.log('\n💡 Creating assumptions...\n');

        await Assumption.create({
            decision_id: decision1.id,
            assumption_text: 'Team has sufficient microservices expertise',
            is_active: true,
            validated_at: new Date()
        });

        await Assumption.create({
            decision_id: decision1.id,
            assumption_text: 'Infrastructure budget can support increased operational complexity',
            is_active: true,
            validated_at: null
        });

        await Assumption.create({
            decision_id: decision2.id,
            assumption_text: 'DevOps team can manage Kubernetes clusters',
            is_active: true,
            validated_at: new Date()
        });

        await Assumption.create({
            decision_id: decision5.id,
            assumption_text: 'Event-driven patterns fit our use cases',
            is_active: true,
            validated_at: null
        });

        console.log('✅ Created assumptions for key decisions');

        // Create history events
        console.log('\n📜 Creating decision history...\n');

        await DecisionHistory.create({
            decision_id: decision1.id,
            event_type: 'CREATED',
            description: 'Decision created after architecture review meeting'
        });

        await DecisionHistory.create({
            decision_id: decision1.id,
            event_type: 'REVIEWED',
            description: 'Reviewed with engineering leadership - confidence remains high'
        });

        await DecisionHistory.create({
            decision_id: decision2.id,
            event_type: 'CREATED',
            description: 'Decision created as part of infrastructure modernization'
        });

        await DecisionHistory.create({
            decision_id: decision2.id,
            event_type: 'REAFFIRMED',
            description: 'Reaffirmed after successful POC with Kubernetes'
        });

        console.log('✅ Created history events');

        console.log('\n✨ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - ${await Decision.count()} decisions created (8 main + 16 sub-decisions)`);
        console.log(`   - ${await DecisionRelation.count()} relationships created (16 SUB_DECISION + 7 main)`);
        console.log(`   - ${await Assumption.count()} assumptions created`);
        console.log(`   - ${await DecisionHistory.count()} history events created\n`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

seedDatabase();
