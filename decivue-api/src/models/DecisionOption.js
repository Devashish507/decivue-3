const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionOption extends Model {
        static associate(models) {
            DecisionOption.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
        }
    }

    DecisionOption.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        decision_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Decisions',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'DecisionOption',
        tableName: 'DecisionOptions',
        underscored: true
    });

    return DecisionOption;
};
