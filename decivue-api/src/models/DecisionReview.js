const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionReview extends Model {
        static associate(models) {
            DecisionReview.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
        }
    }

    DecisionReview.init({
        decision_id: DataTypes.UUID,
        review_date: DataTypes.DATE,
        status: {
            type: DataTypes.ENUM('Pending', 'Completed', 'Overdue'),
            defaultValue: 'Pending'
        },
        notes: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'DecisionReview',
        tableName: 'DecisionReviews'
    });

    return DecisionReview;
};
