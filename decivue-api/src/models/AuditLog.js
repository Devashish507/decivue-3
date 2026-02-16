const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
        }
    }

    AuditLog.init({
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
            }
        },
        user_id: DataTypes.STRING, // Since we don't have a Users table yet
        user_name: DataTypes.STRING,
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        justification: DataTypes.TEXT,
        details: DataTypes.JSON,
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'AuditLogs',
        underscored: true
    });

    return AuditLog;
};
