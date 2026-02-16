const { sequelize } = require('./src/models');

async function checkColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.\n');

        const [results] = await sequelize.query('DESCRIBE DecisionVersions;');

        console.log('=== DecisionVersions Table Structure ===\n');
        results.forEach(col => {
            console.log(`Column: ${col.Field}`);
            console.log(`  Type: ${col.Type}`);
            console.log(`  Null: ${col.Null}`);
            console.log('');
        });

        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkColumns();
