const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Attachment extends Model {
        static associate(models) {
            Attachment.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
        }
    }

    Attachment.init({
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
        file_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        public_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        resource_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: true // Optional if users are not yet implemented
        }
    }, {
        sequelize,
        modelName: 'Attachment',
        tableName: 'DecisionAttachments',
        underscored: true
    });

    return Attachment;
};
