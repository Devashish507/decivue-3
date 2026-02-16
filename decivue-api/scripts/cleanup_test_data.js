const { Decision, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function cleanup() {
    try {
        console.log('Connecting...');
        await sequelize.authenticate();

        console.log('Finding test data...');
        const testDecisions = await Decision.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: 'Test %' } },
                    { title: 'g' },
                    { title: 'A' } // Cleaning up the 'A' from the screenshot too if it's junk
                ]
            }
        });

        console.log(`Found ${testDecisions.length} decisions to clean up.`);

        for (const d of testDecisions) {
            console.log(`Deleting: ${d.title} (${d.id})`);
            // We can't use the controller logic here easily without mocking req/res, 
            // but we can just use the destroy if we don't care about deep clean of edges for this one-off,
            // OR we can rely on our new controller if we ran it via API.
            // Let's just do a rough delete for now to clear the View.
            // Since we updated the controller, let's use the API to delete them properly!
        }
    } catch (e) {
        console.error(e);
    }
}
// Actually, better to just use a fetch script calling the API to ensure cascade works!

const API_URL = 'http://127.0.0.1:5000/api/decisions';
// const fetch = require('undici').fetch; // global fetch in node 18+

async function apiCleanup() {
    try {
        // 1. Get List
        const listRes = await fetch(API_URL);
        const listData = await listRes.json();
        const list = listData.data || [];

        const targets = list.filter(d =>
            d.statement.startsWith('Test ') ||
            d.statement === 'g' ||
            d.statement === 'A' ||
            d.statement === 'test'
        );

        console.log(`Found ${targets.length} targets via API.`);

        for (const t of targets) {
            console.log(`Deleting via API: ${t.statement} (${t.id})`);
            await fetch(`${API_URL}/${t.id}`, { method: 'DELETE' });
        }
        console.log('Cleanup complete.');
    } catch (e) {
        console.error('API Cleanup failed:', e);
    }
}

apiCleanup();
