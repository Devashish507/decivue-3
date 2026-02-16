const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Team extends Model {
        static associate(models) {
            Team.hasMany(models.Decision, { foreignKey: 'team_id', as: 'decisions' });
            Team.hasMany(models.TeamMember, { foreignKey: 'team_id', as: 'teamMembers' });
            Team.hasMany(models.DecisionTeamMap, { foreignKey: 'team_id', as: 'decisionMaps' });
        }
    }

    Team.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        members: {
            type: DataTypes.JSON, // Array of user objects { id, name, role, avatar }
            defaultValue: []
        }
    }, {
        sequelize,
        modelName: 'Team',
        tableName: 'Teams',
        underscored: true
    });

    return Team;
};
