const { Decision, Assumption, DecisionHistory } = require('./src/models');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        console.log('Clearing existing data...');
        await DecisionHistory.destroy({ where: {} });
        await Assumption.destroy({ where: {} });
        await Decision.destroy({ where: {} });

        // Scenario 1: Migrate to Shared Inbox Tool (High confidence, recently reviewed)
        console.log('Creating Scenario 1: Customer Support Migration...');
        const decision1 = await Decision.create({
            title: 'Migrate customer support to a shared inbox tool',
            context: 'Our current email-based support is getting hard to manage as the team grows. Customers sometimes get duplicate replies or no reply at all.',
            initial_confidence: 85,
            current_confidence: 85,
            risk_level: 'Low',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date('2026-02-05'),
            review_due_date: new Date('2026-02-20')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision1.id,
                assumption_text: 'Team will adopt the new tool within 2 weeks',
                is_active: true
            },
            {
                decision_id: decision1.id,
                assumption_text: 'Current email volume is manageable during transition',
                is_active: true
            },
            {
                decision_id: decision1.id,
                assumption_text: 'Budget is approved for the tool subscription',
                is_active: true
            }
        ]);

        await DecisionHistory.bulkCreate([
            {
                decision_id: decision1.id,
                event_type: 'CREATED',
                description: 'Decision created after team discussion',
                created_at: new Date('2026-01-10')
            },
            {
                decision_id: decision1.id,
                event_type: 'REVIEWED',
                description: 'Reviewed and reaffirmed - migration on track',
                created_at: new Date('2026-02-05')
            },
            {
                decision_id: decision1.id,
                event_type: 'UPDATE',
                description: 'Confidence updated from 75% to 85%',
                previous_value: '75',
                new_value: '85',
                created_at: new Date('2026-01-28')
            }
        ]);

        // Scenario 2: Choose Event Venue (Medium confidence, high risk)
        console.log('Creating Scenario 2: Event Venue Selection...');
        const decision2 = await Decision.create({
            title: 'Select Event Venue',
            context: 'Choosing the right location is critical for capacity and logistics. We need to finalize this soon to secure the booking.',
            initial_confidence: 80,
            current_confidence: 80,
            risk_level: 'High',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date('2026-02-12'),
            review_due_date: new Date('2026-03-01')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision2.id,
                assumption_text: 'Venue will be available for our preferred dates',
                is_active: true
            },
            {
                decision_id: decision2.id,
                assumption_text: 'Attendee count estimate is accurate (200-250 people)',
                is_active: true
            },
            {
                decision_id: decision2.id,
                assumption_text: 'Catering can be arranged on-site',
                is_active: true
            }
        ]);

        await DecisionHistory.bulkCreate([
            {
                decision_id: decision2.id,
                event_type: 'CREATED',
                description: 'Decision created after venue scouting',
                created_at: new Date('2026-02-01')
            },
            {
                decision_id: decision2.id,
                event_type: 'REVIEWED',
                description: 'Reviewed venue options, confirmed choice',
                created_at: new Date('2026-02-12')
            }
        ]);

        // Scenario 3: Partner with Influencer Network (Low confidence, needs review)
        console.log('Creating Scenario 3: Influencer Partnership...');
        const decision3 = await Decision.create({
            title: 'Partner With Influencer Network',
            context: 'Boost reach via influencers. This is a new marketing channel for us, so there\'s uncertainty about ROI.',
            initial_confidence: 45,
            current_confidence: 45,
            risk_level: 'High',
            impact_level: 'Medium',
            lifecycle_state: 'Draft',
            last_reviewed_at: new Date('2025-11-04'),
            review_due_date: new Date('2026-02-15')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision3.id,
                assumption_text: 'Influencers will align with our brand values',
                is_active: true
            },
            {
                decision_id: decision3.id,
                assumption_text: 'Budget allocation of $10k is sufficient',
                is_active: false
            },
            {
                decision_id: decision3.id,
                assumption_text: 'We can measure ROI effectively',
                is_active: true
            }
        ]);

        await DecisionHistory.bulkCreate([
            {
                decision_id: decision3.id,
                event_type: 'CREATED',
                description: 'Initial proposal created',
                created_at: new Date('2025-11-04')
            },
            {
                decision_id: decision3.id,
                event_type: 'UPDATE',
                description: 'Budget assumption marked as invalid',
                created_at: new Date('2025-12-15')
            }
        ]);

        // Scenario 4: Adopt Remote-First Policy (High confidence, stable)
        console.log('Creating Scenario 4: Remote-First Policy...');
        const decision4 = await Decision.create({
            title: 'Adopt Remote-First Work Policy',
            context: 'Allow team members to work from anywhere. This supports work-life balance and helps us hire globally.',
            initial_confidence: 90,
            current_confidence: 90,
            risk_level: 'Low',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date('2026-02-10'),
            review_due_date: new Date('2026-05-10')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision4.id,
                assumption_text: 'Team has necessary equipment for remote work',
                is_active: true
            },
            {
                decision_id: decision4.id,
                assumption_text: 'Communication tools are sufficient',
                is_active: true
            },
            {
                decision_id: decision4.id,
                assumption_text: 'Productivity will remain stable or improve',
                is_active: true
            },
            {
                decision_id: decision4.id,
                assumption_text: 'Legal compliance is handled for all locations',
                is_active: true
            }
        ]);

        await DecisionHistory.bulkCreate([
            {
                decision_id: decision4.id,
                event_type: 'CREATED',
                description: 'Policy decision made after 3-month trial',
                created_at: new Date('2025-11-01')
            },
            {
                decision_id: decision4.id,
                event_type: 'REVIEWED',
                description: 'Reviewed after 3 months - very positive results',
                created_at: new Date('2026-02-10')
            },
            {
                decision_id: decision4.id,
                event_type: 'REAFFIRMED',
                description: 'Team unanimously supports continuing the policy',
                created_at: new Date('2026-02-10')
            }
        ]);

        // Scenario 5: Switch to Microservices Architecture (Medium confidence, high risk)
        console.log('Creating Scenario 5: Microservices Migration...');
        const decision5 = await Decision.create({
            title: 'Migrate to Microservices Architecture',
            context: 'Our monolithic application is becoming difficult to scale and deploy. Microservices would give us more flexibility but increase operational complexity.',
            initial_confidence: 60,
            current_confidence: 65,
            risk_level: 'High',
            impact_level: 'High',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date('2026-01-20'),
            review_due_date: new Date('2026-03-20')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision5.id,
                assumption_text: 'Team has expertise in microservices patterns',
                is_active: true
            },
            {
                decision_id: decision5.id,
                assumption_text: 'Infrastructure costs will remain manageable',
                is_active: true
            },
            {
                decision_id: decision5.id,
                assumption_text: 'Migration can be done incrementally over 6 months',
                is_active: true
            },
            {
                decision_id: decision5.id,
                assumption_text: 'Service mesh will solve inter-service communication',
                is_active: true
            }
        ]);

        await DecisionHistory.bulkCreate([
            {
                decision_id: decision5.id,
                event_type: 'CREATED',
                description: 'Architecture decision made after POC',
                created_at: new Date('2025-12-01')
            },
            {
                decision_id: decision5.id,
                event_type: 'UPDATE',
                description: 'Confidence increased after successful first service migration',
                previous_value: '60',
                new_value: '65',
                created_at: new Date('2026-01-15')
            },
            {
                decision_id: decision5.id,
                event_type: 'REVIEWED',
                description: 'Reviewed progress - on track but monitoring closely',
                created_at: new Date('2026-01-20')
            }
        ]);

        // Scenario 6: Finalize Pune Convention Center (Low risk, good logistics)
        console.log('Creating Scenario 6: Pune Convention Center...');
        const decision6 = await Decision.create({
            title: 'Finalize Pune Convention Center',
            context: 'Local option, good logistics. The venue has excellent facilities and is centrally located.',
            initial_confidence: 75,
            current_confidence: 75,
            risk_level: 'Low',
            impact_level: 'Medium',
            lifecycle_state: 'Active',
            last_reviewed_at: new Date('2026-02-12'),
            review_due_date: new Date('2026-02-25')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision6.id,
                assumption_text: 'Venue capacity (300 people) is sufficient',
                is_active: true
            },
            {
                decision_id: decision6.id,
                assumption_text: 'Parking facilities are adequate',
                is_active: true
            },
            {
                decision_id: decision6.id,
                assumption_text: 'AV equipment meets our requirements',
                is_active: true
            }
        ]);

        await DecisionHistory.bulkCreate([
            {
                decision_id: decision6.id,
                event_type: 'CREATED',
                description: 'Venue selected after site visit',
                created_at: new Date('2026-01-15')
            },
            {
                decision_id: decision6.id,
                event_type: 'REVIEWED',
                description: 'Contract terms reviewed and approved',
                created_at: new Date('2026-02-12')
            }
        ]);

        // Scenario 7: Launch Mobile App (Draft, low confidence)
        console.log('Creating Scenario 7: Mobile App Launch...');
        const decision7 = await Decision.create({
            title: 'Launch Mobile App for Customer Portal',
            context: 'Customers are requesting mobile access. However, we need to validate if the investment is worth it given our current web traffic.',
            initial_confidence: 40,
            current_confidence: 40,
            risk_level: 'Medium',
            impact_level: 'High',
            lifecycle_state: 'Draft',
            last_reviewed_at: null,
            review_due_date: new Date('2026-03-01')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision7.id,
                assumption_text: 'At least 30% of users will adopt the mobile app',
                is_active: true
            },
            {
                decision_id: decision7.id,
                assumption_text: 'Development can be completed in 4 months',
                is_active: true
            },
            {
                decision_id: decision7.id,
                assumption_text: 'Mobile app will improve customer satisfaction scores',
                is_active: true
            }
        ]);

        await DecisionHistory.create({
            decision_id: decision7.id,
            event_type: 'CREATED',
            description: 'Proposal created based on customer feedback',
            created_at: new Date('2026-02-01')
        });

        // Scenario 8: Implement AI Chatbot (Stale, needs review)
        console.log('Creating Scenario 8: AI Chatbot Implementation...');
        const decision8 = await Decision.create({
            title: 'Implement AI-Powered Customer Support Chatbot',
            context: 'Automate responses to common questions. This decision was made 6 months ago but hasn\'t been reviewed since.',
            initial_confidence: 70,
            current_confidence: 70,
            risk_level: 'Medium',
            impact_level: 'Medium',
            lifecycle_state: 'Stale',
            last_reviewed_at: new Date('2025-08-01'),
            review_due_date: new Date('2025-11-01')
        });

        await Assumption.bulkCreate([
            {
                decision_id: decision8.id,
                assumption_text: 'AI can handle 60% of support queries',
                is_active: true
            },
            {
                decision_id: decision8.id,
                assumption_text: 'Customers will accept chatbot interactions',
                is_active: true
            },
            {
                decision_id: decision8.id,
                assumption_text: 'Integration with existing CRM is feasible',
                is_active: false
            }
        ]);

        await DecisionHistory.bulkCreate([
            {
                decision_id: decision8.id,
                event_type: 'CREATED',
                description: 'Decision made after vendor demos',
                created_at: new Date('2025-08-01')
            },
            {
                decision_id: decision8.id,
                event_type: 'UPDATE',
                description: 'CRM integration assumption invalidated',
                created_at: new Date('2025-09-15')
            }
        ]);

        console.log('✅ Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log('- 8 decisions created');
        console.log('- Multiple assumptions per decision');
        console.log('- Various lifecycle states (Active, Draft, Stale)');
        console.log('- Different confidence levels (40% - 90%)');
        console.log('- Mix of risk levels (Low, Medium, High)');
        console.log('- Review history and timeline events');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
