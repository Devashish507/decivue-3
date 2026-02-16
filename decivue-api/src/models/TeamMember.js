const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TeamMember extends Model {
        static associate(models) {
            TeamMember.belongsTo(models.Team, { foreignKey: 'team_id', as: 'team' });
            // We don't have a User model yet, so no belongsTo User
        }
    }

    TeamMember.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        team_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Teams',
                key: 'id'
            }
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_name: { // Store redundant name for ease of display without User table
            type: DataTypes.STRING,
            allowNull: false
        },
        user_avatar: { // Store redundant avatar string
            type: DataTypes.STRING
        },
        role: {
            type: DataTypes.ENUM('Owner', 'Reviewer', 'Contributor'),
            defaultValue: 'Contributor'
        }
    }, {
        sequelize,
        modelName: 'TeamMember',
        tableName: 'TeamMembers',
        underscored: true
    });

    return TeamMember;
};
