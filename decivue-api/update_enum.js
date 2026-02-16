const { sequelize } = require('./src/models');

async function updateEnumValues() {
    try {
        console.log('🔧 Updating DecisionRelations enum values...\n');

        // Update the enum type
        await sequelize.query(`
            ALTER TABLE DecisionRelations 
            MODIFY COLUMN relation_type ENUM(
                'DEPENDS_ON',
                'SUPPORTS',
                'CONFLICTS_WITH',
                'DERIVED_FROM',
                'SUB_DECISION',
                'RELATES_TO'
            ) NOT NULL DEFAULT 'RELATES_TO';
        `);

        console.log('✅ Successfully updated relation_type enum values\n');
        console.log('New values:');
        console.log('  - DEPENDS_ON');
        console.log('  - SUPPORTS');
        console.log('  - CONFLICTS_WITH');
        console.log('  - DERIVED_FROM');
        console.log('  - SUB_DECISION');
        console.log('  - RELATES_TO\n');

    } catch (error) {
        console.error('❌ Error updating enum:', error.message);
        throw error;
    } finally {
        await sequelize.close();
    }
}

updateEnumValues();
