'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionEdge extends Model {
        static associate(models) {
            DecisionEdge.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
            DecisionEdge.belongsTo(models.DecisionNode, { foreignKey: 'source_node_id', as: 'sourceNode' });
            DecisionEdge.belongsTo(models.DecisionNode, { foreignKey: 'target_node_id', as: 'targetNode' });
        }
    }
    DecisionEdge.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        decision_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        source_node_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        target_node_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        relationship_type: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'DecisionEdge',
        tableName: 'DecisionEdges',
        underscored: true
    });
    return DecisionEdge;
};
