const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionVersion extends Model {
        static associate(models) {
            DecisionVersion.belongsTo(models.Decision, { foreignKey: 'decision_id' });
        }
    }

    DecisionVersion.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        decision_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        version_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        snapshot_json: {
            type: DataTypes.JSON, // Use JSON for MySQL/Postgres, or TEXT for SQLite
            allowNull: false
        },
        changed_fields_json: {
            type: DataTypes.JSON,
            allowNull: true
        },
        confidence_before: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        confidence_after: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_by: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'DecisionVersion',
        tableName: 'DecisionVersions',
        underscored: true
    });

    return DecisionVersion;
};
