const { sequelize } = require('../src/models');

async function fixEnums() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Updating decision_type ENUM...');
        await sequelize.query(`
            ALTER TABLE Decisions 
            MODIFY COLUMN decision_type ENUM(
                'strategic', 'operational', 'risk', 'support', 
                'MAIN_STRATEGIC', 'SUB_DECISION', 'SUPPORTING', 
                'DEPENDENT', 'RISK_MITIGATION'
            ) NOT NULL
        `);

        console.log('Updating risk_level ENUM...');
        await sequelize.query(`
            ALTER TABLE Decisions 
            MODIFY COLUMN risk_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium'
        `);

        console.log('Updating impact_level ENUM...');
        await sequelize.query(`
            ALTER TABLE Decisions 
            MODIFY COLUMN impact_level ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium'
        `);

        console.log('ENUMs updated successfully.');
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await sequelize.close();
    }
}

fixEnums();
