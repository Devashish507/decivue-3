const { sequelize, Decision, Team, DecisionTeamMap } = require('./src/models');
const fs = require('fs');

async function debugDb() {
    const logFile = 'db_debug_results.log';
    const log = (msg) => {
        fs.appendFileSync(logFile, msg + '\n');
        console.log(msg);
    };

    fs.writeFileSync(logFile, '--- Database Debug Report ---\n');

    try {
        await sequelize.authenticate();
        log('Connected to database.');

        const decisions = await Decision.findAll({ attributes: ['id', 'title'] });
        log(`\nDecisions (${decisions.length}):`);
        decisions.forEach(d => log(`  - ${d.id}: ${d.title}`));

        const teams = await Team.findAll({ attributes: ['id', 'name'] });
        log(`\nTeams (${teams.length}):`);
        teams.forEach(t => log(`  - ${t.id}: ${t.name}`));

        const maps = await DecisionTeamMap.findAll();
        log(`\nDecisionTeamMaps (${maps.length}):`);
        maps.forEach(m => log(`  - Map ID: ${m.id}, Decision: ${m.decision_id}, Team: ${m.team_id}`));

        await sequelize.close();
        log('\nDone.');
    } catch (err) {
        log(`\n❌ Error: ${err.message}`);
        log(err.stack);
    }
}

debugDb();
