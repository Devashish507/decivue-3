const { sequelize } = require('./src/models');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.\n');

        const [results] = await sequelize.query('SELECT id, title FROM Decisions;');

        console.log('=== Decisions in DB ===\n');
        results.forEach((row, idx) => {
            console.log(`${idx + 1}. ID: ${row.id} - Title: ${row.title}`);
        });

        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkData();
