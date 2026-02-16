/**
 * ============================================================
 *  Decivue — Full Database Setup Script
 * ============================================================
 *  Run this on any new device to create ALL tables at once.
 *
 *  Usage:
 *    1. Make sure MySQL is running and the database exists:
 *       mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS decivue_db;"
 *
 *    2. Set env vars (or rely on defaults in config.js):
 *       DB_HOST=127.0.0.1  DB_USER=root  DB_PASSWORD=password  DB_NAME=decivue_db
 *
 *    3. Run this script:
 *       node setup_database.js
 *
 *    4. (Optional) Seed sample data:
 *       node seed_database.js
 *       node seed_teams_governance.js
 *
 *  This calls sequelize.sync({ alter: true }) which creates
 *  missing tables and adds missing columns to existing ones
 *  without destroying data.
 * ============================================================
 */

const db = require('./src/models');

async function setupDatabase() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        Decivue — Database Setup                 ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ── 1. Test connection ────────────────────────────────────
    try {
        await db.sequelize.authenticate();
        console.log('✅  Database connection established successfully.');
        console.log(`   Host    : ${db.sequelize.config.host}`);
        console.log(`   Database: ${db.sequelize.config.database}`);
        console.log(`   Dialect : ${db.sequelize.options.dialect}\n`);
    } catch (err) {
        console.error('❌  Unable to connect to the database:', err.message);
        console.error('\n   Make sure MySQL is running and the database exists:');
        console.error('   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS decivue_db;"');
        process.exit(1);
    }

    // ── 2. List all registered models ─────────────────────────
    const modelNames = Object.keys(db).filter(
        k => k !== 'sequelize' && k !== 'Sequelize'
    );
    console.log(`📦  Found ${modelNames.length} models:`);
    modelNames.forEach(name => {
        const tableName = db[name].getTableName?.() || name;
        console.log(`   • ${name}  →  ${tableName}`);
    });
    console.log('');

    // ── 3. Sync all tables ────────────────────────────────────
    console.log('⏳  Syncing database (alter: true) — creating/updating all tables...\n');

    try {
        await db.sequelize.sync({ alter: true });
        console.log('✅  All tables synced successfully!\n');

        // FORCE ADD COLUMNS IF MISSING (Sequelize alter can be flaky with JSON)
        try {
            console.log('🔧  Ensuring JSON columns exist in DecisionVersions...');
            await db.sequelize.query(`
                ALTER TABLE DecisionVersions 
                ADD COLUMN snapshot_json JSON NULL,
                ADD COLUMN changed_fields_json JSON NULL;
            `).catch(err => {
                // Ignore "start with Duplicate column name" error
                if (!err.message.includes("Duplicate column name")) {
                    console.log('   (Note: Columns likely already exist or other error:', err.message, ')');
                }
            });
            console.log('✅  Manual column check complete.\n');
        } catch (e) {
            console.log('   Manual column check skipped/failed (non-fatal).\n');
        }

    } catch (err) {
        console.error('❌  Error syncing database:', err.message);
        console.error('\n   Full error:\n', err);
        process.exit(1);
    }

    // ── 4. Verify created tables ──────────────────────────────
    try {
        const [results] = await db.sequelize.query('SHOW TABLES');
        const key = Object.keys(results[0] || {})[0];
        const tables = results.map(r => r[key]);
        console.log(`📋  Tables in database (${tables.length}):`);
        tables.forEach(t => console.log(`   ✓ ${t}`));
        console.log('');
    } catch (err) {
        // Non-fatal — some dialects may not support SHOW TABLES
        console.log('   (Could not list tables — this is non-fatal)\n');
    }

    // ── 5. Summary ────────────────────────────────────────────
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  ✅  Setup complete!                             ║');
    console.log('║                                                  ║');
    console.log('║  Next steps:                                     ║');
    console.log('║    node seed_database.js          (seed data)    ║');
    console.log('║    node seed_teams_governance.js   (seed teams)  ║');
    console.log('║    npm start                       (run server)  ║');
    console.log('╚══════════════════════════════════════════════════╝');

    await db.sequelize.close();
    process.exit(0);
}

setupDatabase();
