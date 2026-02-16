const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionRelation extends Model {
        static associate(models) {
            // Belongs to source decision
            DecisionRelation.belongsTo(models.Decision, {
                foreignKey: 'source_decision_id',
                as: 'sourceDecision'
            });

            // Belongs to target decision
            DecisionRelation.belongsTo(models.Decision, {
                foreignKey: 'target_decision_id',
                as: 'targetDecision'
            });
        }
    }

    DecisionRelation.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        source_decision_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        target_decision_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        relation_type: {
            type: DataTypes.ENUM(
                'DEPENDS_ON',      // Decision depends on another
                'SUPPORTS',        // Decision supports another
                'CONFLICTS_WITH',  // Decision conflicts with another
                'DERIVED_FROM',    // Decision derived from another
                'SUB_DECISION',    // Child decision of parent
                'RELATES_TO'       // Generic relationship
            ),
            allowNull: false,
            defaultValue: 'RELATES_TO'
        },
        notes: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'DecisionRelation',
        tableName: 'DecisionRelations',
        underscored: true
    });

    return DecisionRelation;
};
