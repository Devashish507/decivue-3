const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionHistory extends Model {
        static associate(models) {
            DecisionHistory.belongsTo(models.Decision, { foreignKey: 'decision_id' });
        }
    }

    DecisionHistory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        decision_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        previous_value: DataTypes.TEXT, // Simple string storage for values for now
        new_value: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'DecisionHistory',
        tableName: 'DecisionHistories',
        underscored: true
    });

    return DecisionHistory;
};
