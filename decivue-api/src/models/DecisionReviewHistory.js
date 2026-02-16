const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionReviewHistory extends Model {
        static associate(models) {
            DecisionReviewHistory.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
        }
    }

    DecisionReviewHistory.init({
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
        confidence_snapshot: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        conflict_count_snapshot: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        assumption_count_snapshot: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        review_notes: DataTypes.TEXT,
        reviewed_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        is_shallow_review: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'DecisionReviewHistory',
        tableName: 'DecisionReviewHistories',
        underscored: true
    });

    return DecisionReviewHistory;
};
