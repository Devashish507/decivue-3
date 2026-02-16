const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Assumption extends Model {
        static associate(models) {
            Assumption.belongsTo(models.Decision, { foreignKey: 'decision_id' });
        }
    }

    Assumption.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        decision_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        assumption_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Assumption',
        tableName: 'Assumptions',
        underscored: true
    });

    return Assumption;
};
