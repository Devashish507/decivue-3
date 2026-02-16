const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionProgressHistory extends Model {
        static associate(models) {
            DecisionProgressHistory.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
        }
    }

    DecisionProgressHistory.init({
        decision_id: DataTypes.UUID,
        recorded_progress: DataTypes.FLOAT,
        recorded_confidence: DataTypes.FLOAT,
        recorded_health: DataTypes.FLOAT,
        recorded_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'DecisionProgressHistory',
        tableName: 'DecisionProgressHistories'
    });

    return DecisionProgressHistory;
};
