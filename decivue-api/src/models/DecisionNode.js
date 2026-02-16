'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DecisionNode extends Model {
        static associate(models) {
            DecisionNode.belongsTo(models.Decision, { foreignKey: 'decision_id', as: 'decision' });
            DecisionNode.hasMany(models.DecisionEdge, { foreignKey: 'source_node_id', as: 'outgoingEdges' });
            DecisionNode.hasMany(models.DecisionEdge, { foreignKey: 'target_node_id', as: 'incomingEdges' });
        }
    }
    DecisionNode.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        decision_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        node_type: {
            type: DataTypes.ENUM('goal', 'option', 'assumption', 'risk', 'confidence'),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        parent_node_id: {
            type: DataTypes.UUID,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'DecisionNode',
        tableName: 'DecisionNodes',
        underscored: true
    });
    return DecisionNode;
};
