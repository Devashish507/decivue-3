const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Decision extends Model {
        static associate(models) {
            Decision.hasMany(models.Assumption, { foreignKey: 'decision_id', as: 'assumptions' });
            Decision.hasMany(models.DecisionHistory, { foreignKey: 'decision_id', as: 'history' });
            Decision.hasMany(models.DecisionOption, { foreignKey: 'decision_id', as: 'options' });

            // Self-referential for Tree
            Decision.belongsTo(models.Decision, { as: 'parent', foreignKey: 'parent_id' });
            Decision.hasMany(models.Decision, { as: 'children', foreignKey: 'parent_id' });

            // Graph Nodes
            Decision.hasMany(models.DecisionNode, { foreignKey: 'decision_id', as: 'nodes' });
            Decision.hasMany(models.DecisionEdge, { foreignKey: 'decision_id', as: 'edges' });

            // Relationships - outgoing
            Decision.hasMany(models.DecisionRelation, {
                foreignKey: 'source_decision_id',
                as: 'outgoingRelations'
            });

            // Relationships - incoming
            Decision.hasMany(models.DecisionRelation, {
                foreignKey: 'target_decision_id',
                as: 'incomingRelations'
            });

            Decision.hasMany(models.AuditLog, { foreignKey: 'decision_id', as: 'auditLogs' });
            Decision.hasOne(models.DecisionTeamMap, { foreignKey: 'decision_id', as: 'teamMap' });

            // Conflict/Relations (many-to-many)
            Decision.belongsToMany(models.Decision, {
                through: models.DecisionRelation,
                as: 'relatedDecisions',
                foreignKey: 'source_decision_id',
                otherKey: 'target_decision_id'
            });

            // Tracking
            Decision.hasOne(models.SubDecisionTracking, { foreignKey: 'sub_decision_id', as: 'tracking' });

            // Attachments
            Decision.hasMany(models.Attachment, { foreignKey: 'decision_id', as: 'attachments' });

            // Governance & Team
            Decision.belongsTo(models.Team, { foreignKey: 'team_id', as: 'team' });
        }
    }

    Decision.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        context: DataTypes.TEXT,
        decision_type: {
            type: DataTypes.ENUM('strategic', 'operational', 'risk', 'support', 'MAIN_STRATEGIC', 'SUB_DECISION', 'SUPPORTING', 'DEPENDENT', 'RISK_MITIGATION'),
            allowNull: false
        },
        parent_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Decisions',
                key: 'id'
            }
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },
        priority_level: {
            type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
            defaultValue: 'MEDIUM'
        },
        initial_confidence: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            validate: { min: 0, max: 100 }
        },
        current_confidence: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            validate: { min: 0, max: 100 }
        },
        risk_level: {
            type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
            defaultValue: 'Medium'
        },
        impact_level: {
            type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
            defaultValue: 'Medium'
        },
        lifecycle_state: {
            type: DataTypes.ENUM('Draft', 'Active', 'Stale', 'Closed'),
            defaultValue: 'Draft'
        },
        parent_decision_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        last_reviewed_at: DataTypes.DATE,
        review_due_date: DataTypes.DATE,
        target_review_date: DataTypes.DATE,
        confidence_justification: DataTypes.TEXT,
        progress_percentage: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: { min: 0, max: 100 }
        },
        start_date: DataTypes.DATE,
        target_date: DataTypes.DATE,
        expected_duration_days: DataTypes.INTEGER,
        health_score: {
            type: DataTypes.FLOAT,
            defaultValue: 100
        },
        last_progress_update: DataTypes.DATE,

        // Governance Fields
        is_governance_required: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        governance_status: {
            type: DataTypes.ENUM('Draft', 'Pending Approval', 'Approved', 'Rejected'),
            defaultValue: 'Draft'
        },
        owner_id: DataTypes.STRING,
        reviewer_id: DataTypes.STRING,
        team_id: {
            type: DataTypes.UUID,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Decision',
        tableName: 'Decisions',
        underscored: true
    });

    return Decision;
};
