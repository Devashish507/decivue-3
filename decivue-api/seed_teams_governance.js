const { sequelize, Team, TeamMember, Decision, DecisionTeamMap } = require('./src/models');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await sequelize.sync({ alter: true }); // Ensure tables exist and match models

        // 1. Clear existing team data
        await DecisionTeamMap.destroy({ where: {}, force: true });
        await TeamMember.destroy({ where: {}, force: true });
        await Team.destroy({ where: {}, force: true });
        console.log('Cleared existing team data.');

        // 2. Create Teams
        const teamsData = [
            {
                name: 'Engineering Leadership',
                description: 'Responsible for architectural decisions and tech stack choices.'
            },
            {
                name: 'Product Strategy',
                description: 'Focuses on feature roadmap, user experience, and market fit.'
            },
        ];

        const createdTeams = await Team.bulkCreate(teamsData, { returning: true });
        const [engTeam, prodTeam] = createdTeams;
        console.log(`Created ${createdTeams.length} teams.`);

        // 3. Create Users (Mock) & Assign to Teams
        const membersData = [
            // Engineering Team
            { team_id: engTeam.id, user_id: 'u1', user_name: 'Alice Chen', role: 'Owner', user_avatar: 'A' },
            { team_id: engTeam.id, user_id: 'u2', user_name: 'Bob Smith', role: 'Reviewer', user_avatar: 'B' },
            { team_id: engTeam.id, user_id: 'u3', user_name: 'Charlie Kim', role: 'Contributor', user_avatar: 'C' },
            { team_id: engTeam.id, user_id: 'u4', user_name: 'David Lee', role: 'Contributor', user_avatar: 'D' },

            // Product Team
            { team_id: prodTeam.id, user_id: 'u5', user_name: 'Eva Green', role: 'Owner', user_avatar: 'E' },
            { team_id: prodTeam.id, user_id: 'u6', user_name: 'Frank White', role: 'Reviewer', user_avatar: 'F' },
            { team_id: prodTeam.id, user_id: 'u7', user_name: 'Grace Liu', role: 'Contributor', user_avatar: 'G' },

        ];

        await TeamMember.bulkCreate(membersData);
        console.log(`Created ${membersData.length} team members.`);

        // 4. Map Decisions to Teams
        const allDecisions = await Decision.findAll();
        if (allDecisions.length > 0) {
            const mappings = [];

            // Distributed assignment
            for (let i = 0; i < allDecisions.length; i++) {
                const decision = allDecisions[i];
                let team, owner, reviewer;

                if (i % 2 === 0) {
                    team = engTeam;
                    owner = 'u1'; // Alice
                    reviewer = 'u2'; // Bob
                } else {
                    team = prodTeam;
                    owner = 'u5'; // Eva
                    reviewer = 'u6'; // Frank
                }

                mappings.push({
                    decision_id: decision.id,
                    team_id: team.id,
                    owner_id: owner,
                    reviewer_id: reviewer
                });

                // Update legacy fields on Decision for backward compatibility if needed, 
                // but primary source is now DecisionTeamMap. 
                // We will keep them in sync for now as per "Minimal Safe DB Add" instruction to NOT alter decision table too much? 
                // Wait, prompt said "Do NOT alter existing decision table — only mapping table." 
                // BUT "Map seeded decisions → teams". 
                // I will update the map.

                // Optional: Update the denormalized fields on decision if I added them earlier?
                // yes I added team_id, owner_id, reviewer_id to Decision table in previous set.
                // I should sync them.
                await decision.update({
                    team_id: team.id,
                    owner_id: owner,
                    reviewer_id: reviewer,
                    is_governance_required: i % 4 === 0 // Make every 4th decision governance required
                });
            }

            await DecisionTeamMap.bulkCreate(mappings);
            console.log(`Mapped ${mappings.length} decisions to teams.`);
        } else {
            console.log('No decisions found to map.');
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
