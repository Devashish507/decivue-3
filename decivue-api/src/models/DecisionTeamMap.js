const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionTeamMap extends Model {
        static associate(models) {
            DecisionTeamMap.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
            DecisionTeamMap.belongsTo(models.Team, { foreignKey: 'team_id', as: 'team' });
        }
    }

    DecisionTeamMap.init({
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
        team_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Teams',
                key: 'id'
            }
        },
        owner_id: {
            type: DataTypes.STRING // User ID of the decision owner within this team context
        },
        reviewer_id: {
            type: DataTypes.STRING // User ID of the assigned reviewer
        }
    }, {
        sequelize,
        modelName: 'DecisionTeamMap',
        tableName: 'DecisionTeamMaps',
        underscored: true
    });

    return DecisionTeamMap;
};
