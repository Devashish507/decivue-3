/**
 * Backfill: Map all existing decisions to the default team
 * Run once: node backfill_team_map.js
 */
require('dotenv').config();
const { Decision, Team, DecisionTeamMap, sequelize } = require('./src/models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected.');

        // Sync to ensure DecisionTeamMaps table exists
        await sequelize.sync({ alter: true });

        let team = await Team.findOne();
        if (!team) {
            team = await Team.create({ name: 'Default Team', description: 'Auto-created default team' });
            console.log('Created default team:', team.id);
        } else {
            console.log('Using existing team:', team.name, team.id);
        }

        const decisions = await Decision.findAll({ attributes: ['id', 'title'] });
        console.log(`Found ${decisions.length} decisions to map.`);

        let created = 0;
        for (const d of decisions) {
            const [, wasCreated] = await DecisionTeamMap.findOrCreate({
                where: { decision_id: d.id, team_id: team.id },
                defaults: { decision_id: d.id, team_id: team.id }
            });
            if (wasCreated) {
                created++;
                console.log(`  Mapped: ${d.title}`);
            }
        }

        console.log(`\nDone! ${created} new mappings created (${decisions.length - created} already existed).`);
        process.exit(0);
    } catch (err) {
        console.error('Backfill error:', err);
        process.exit(1);
    }
})();
