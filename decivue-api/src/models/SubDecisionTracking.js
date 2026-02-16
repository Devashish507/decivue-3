const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SubDecisionTracking extends Model {
        static associate(models) {
            SubDecisionTracking.belongsTo(models.Decision, { foreignKey: 'sub_decision_id', as: 'decision' });
        }
    }

    SubDecisionTracking.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sub_decision_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Decisions',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
            defaultValue: 'Pending'
        },
        weight: {
            type: DataTypes.FLOAT,
            defaultValue: 1.0
        },
        completion_percentage: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: { min: 0, max: 100 }
        }
    }, {
        sequelize,
        modelName: 'SubDecisionTracking',
        tableName: 'SubDecisionTracking',
        underscored: true
    });

    return SubDecisionTracking;
};
