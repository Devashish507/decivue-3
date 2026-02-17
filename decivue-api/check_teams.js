const { Team } = require('./src/models');

async function checkTeams() {
    try {
        const count = await Team.count();
        console.log('--- DB Check ---');
        console.log('Total Teams in DB:', count);
        if (count === 0) {
            console.log('WARNING: No teams found. The addToTeam endpoint requires at least one team to function.');
        } else {
            const firstTeam = await Team.findOne();
            console.log('First Team ID:', firstTeam.id);
        }
    } catch (err) {
        console.error('Error checking teams:', err);
    } finally {
        process.exit();
    }
}

checkTeams();
