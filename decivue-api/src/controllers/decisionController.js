const { Decision, Assumption, DecisionRelation, DecisionHistory, DecisionVersion, AuditLog, DecisionTeamMap, Team, sequelize } = require('../models');
const treeService = require('../services/treeService');
const healthService = require('../services/healthService');
const reviewIntelligenceService = require('../services/reviewIntelligenceService');
const { Op } = require('sequelize');
const conflictDetectionService = require('../services/conflictDetectionService');

exports.getAllDecisions = async (req, res) => {
    try {
        const { includeSubDecisions } = req.query;

        // Build where clause
        const whereClause = {};

        // If not explicitly including sub-decisions, only show root decisions
        if (includeSubDecisions !== 'true') {
            whereClause.parent_id = null;
        }

        // Get decisions
        console.log('[API] getAllDecisions query:', req.query);
        console.log('[API] whereClause:', JSON.stringify(whereClause, null, 2));

        // Debug: Check if any decisions exist with parent_id != null
        const subCount = await Decision.count({ where: { parent_id: { [Op.ne]: null } } });
        console.log(`[API] DB Check: Total sub-decisions in DB: ${subCount}`);

        const decisions = await Decision.findAll({
            where: whereClause,
            include: [
                {
                    model: Decision,
                    as: 'children',
                    attributes: ['id', 'title', 'lifecycle_state', 'current_confidence', 'risk_level', 'progress_percentage'],
                    include: [{ model: require('../models').SubDecisionTracking, as: 'tracking' }]
                },
                {
                    model: DecisionRelation,
                    as: 'outgoingRelations',
                    include: [{
                        model: Decision,
                        as: 'targetDecision',
                        attributes: ['id', 'title']
                    }]
                },
                {
                    model: DecisionRelation,
                    as: 'incomingRelations',
                    include: [{
                        model: Decision,
                        as: 'sourceDecision',
                        attributes: ['id', 'title']
                    }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        console.log(`[API] Found ${decisions.length} decisions`);

        // Calculate health for each decision
        const decisionsWithHealth = await Promise.all(
            decisions.map(async (decision) => {
                console.log(`Calculating health for: ${decision.title}`);
                const healthResult = await healthService.calculateHealth(decision);
                console.log(`Health result:`, healthResult);
                const { healthScore, newHealthStatus, conflicts } = healthResult;
                return {
                    ...decision.toJSON(),
                    calculated_health: {
                        score: healthScore,
                        status: newHealthStatus,
                        conflict_count: conflicts
                    }
                };
            })
        );

        res.json({ success: true, data: decisionsWithHealth });
    } catch (err) {
        console.error('getAllDecisions error:', err);
        const fs = require('fs');
        fs.appendFileSync('api_errors.log', `${new Date().toISOString()} - getAllDecisions Error: ${err.stack}\n`);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDecisionById = async (req, res) => {
    try {
        console.log(`[API] Fetching decision with ID: ${req.params.id}`);

        const decision = await Decision.findByPk(req.params.id, {
            include: [
                { model: Assumption, as: 'assumptions' },
                { model: DecisionHistory, as: 'history' },
                { model: Decision, as: 'parent' },
                { model: require('../models').SubDecisionTracking, as: 'tracking' },
                {
                    model: Decision,
                    as: 'children',
                    attributes: ['id', 'title', 'lifecycle_state', 'current_confidence', 'risk_level', 'progress_percentage'],
                    include: [{ model: require('../models').SubDecisionTracking, as: 'tracking' }]
                },
                {
                    model: DecisionRelation,
                    as: 'outgoingRelations',
                    include: [{
                        model: Decision,
                        as: 'targetDecision',
                        attributes: ['id', 'title']
                    }]
                },
                {
                    model: DecisionRelation,
                    as: 'incomingRelations',
                    include: [{
                        model: Decision,
                        as: 'sourceDecision',
                        attributes: ['id', 'title']
                    }]
                },
                { model: AuditLog, as: 'auditLogs' }
            ]
        });

        if (!decision) {
            console.log(`[API] Decision not found: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                message: 'Decision not found'
            });
        }

        console.log(`[API] Decision found: ${decision.title}`);
        console.log(`[API] Assumptions count: ${decision.assumptions?.length || 0}`);
        console.log(`[API] History events count: ${decision.history?.length || 0}`);

        // Validate decision data completeness
        if (!decision.id || !decision.title) {
            console.error(`[API] Decision has missing required fields:`, {
                id: decision.id,
                title: decision.title
            });
            return res.status(500).json({
                success: false,
                message: 'Decision data is incomplete - missing required fields'
            });
        }

        // Log warnings for missing optional fields
        if (!decision.context) console.warn(`[API] Decision ${decision.id} missing context`);
        if (!decision.current_confidence) console.warn(`[API] Decision ${decision.id} missing current_confidence`);

        // Calculate dynamic health info on fetch
        const { healthScore, newHealthStatus, conflicts, logEvents } = await healthService.calculateHealth(decision);

        res.json({
            success: true,
            data: {
                ...decision.toJSON(),
                calculated_confidence: healthScore, // Dynamic confidence based on criteria
                calculated_health: {
                    score: healthScore,
                    status: newHealthStatus,
                    conflict_count: conflicts,
                    log_events: logEvents
                }
            }
        });
    } catch (err) {
        console.error('[API] Error fetching decision:', err.message);
        console.error('[API] Stack trace:', err.stack);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getDecisionTree = async (req, res) => {
    try {
        const tree = await treeService.getTree(req.params.id);
        if (!tree) return res.status(404).json({ success: false, message: 'Tree root not found' });
        res.json({ success: true, data: tree });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateDecision = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('========================================');
        console.log('UPDATE DECISION CALLED FOR ID:', id);
        console.log('========================================');

        const decision = await Decision.findByPk(id, {
            include: [{ model: Assumption, as: 'assumptions' }]
        });

        if (!decision) {
            return res.status(404).json({ success: false, message: 'Decision not found' });
        }

        const oldData = decision.toJSON();
        const { title, context, current_confidence, risk_level, impact_level, lifecycle_state, start_date, target_date } = req.body;

        // --- VERSIONING LOGIC START ---
        // 1. Calculate diffs
        const changes = {};
        if (title && title !== oldData.title) changes.title = { from: oldData.title, to: title };
        if (context && context !== oldData.context) changes.context = { from: oldData.context, to: context };
        if (current_confidence !== undefined && current_confidence !== oldData.current_confidence) {
            changes.confidence = { from: oldData.current_confidence, to: current_confidence };
        }
        if (risk_level && risk_level !== oldData.risk_level) changes.risk = { from: oldData.risk_level, to: risk_level };
        if (lifecycle_state && lifecycle_state !== oldData.lifecycle_state) changes.state = { from: oldData.lifecycle_state, to: lifecycle_state };

        // 2. Create version snapshot if there are meaningful changes
        if (Object.keys(changes).length > 0) {
            console.log('[VERSIONING] Changes detected:', changes);
            console.log('[VERSIONING] oldData keys:', Object.keys(oldData));
            console.log('[VERSIONING] oldData.title:', oldData.title);

            const lastVersion = await DecisionVersion.findOne({
                where: { decision_id: id },
                order: [['version_number', 'DESC']]
            });
            const nextVersionNumber = (lastVersion?.version_number || 0) + 1;

            const snapshotString = JSON.stringify(oldData);
            const changesString = JSON.stringify(changes);

            console.log('[VERSIONING] Creating version', nextVersionNumber);
            console.log('[VERSIONING] snapshot_json length:', snapshotString.length);
            console.log('[VERSIONING] snapshot_json preview:', snapshotString.substring(0, 100));

            const newVersion = await DecisionVersion.create({
                decision_id: id,
                version_number: nextVersionNumber,
                snapshot_json: snapshotString,
                changed_fields_json: changesString,
                confidence_before: oldData.current_confidence,
                confidence_after: current_confidence !== undefined ? current_confidence : oldData.current_confidence,
                created_by: 'System' // Placeholder until auth is fully integrated
            });

            console.log('[VERSIONING] Version created with ID:', newVersion.id);
            console.log('[VERSIONING] Saved snapshot_json type:', typeof newVersion.snapshot_json);
        } else {
            console.log('[VERSIONING] No changes detected, skipping version creation');
        }
        // --- VERSIONING LOGIC END ---

        // Governance Automation
        let governanceRequired = req.body.is_governance_required !== undefined ? req.body.is_governance_required : decision.is_governance_required;
        const newRisk = risk_level !== undefined ? risk_level : decision.risk_level;

        if (['High', 'Critical'].includes(newRisk)) {
            governanceRequired = true;
        }

        // Update basic fields
        await decision.update({
            title: title !== undefined ? title : decision.title,
            context: context !== undefined ? context : decision.context,
            current_confidence: current_confidence !== undefined ? current_confidence : decision.current_confidence,
            risk_level: risk_level !== undefined ? risk_level : decision.risk_level,
            impact_level: impact_level !== undefined ? impact_level : decision.impact_level,
            lifecycle_state: lifecycle_state !== undefined ? lifecycle_state : decision.lifecycle_state,
            start_date: start_date !== undefined ? start_date : decision.start_date,
            target_date: target_date !== undefined ? target_date : decision.target_date,
            // New fields
            is_governance_required: governanceRequired,
            team_id: req.body.team_id !== undefined ? req.body.team_id : decision.team_id,
            owner_id: req.body.owner_id !== undefined ? req.body.owner_id : decision.owner_id,
            reviewer_id: req.body.reviewer_id !== undefined ? req.body.reviewer_id : decision.reviewer_id
        });

        // Track changes in history (Text summary for timeline)
        const historyChanges = [];
        if (changes.title) historyChanges.push(`Title changed from "${changes.title.from}" to "${changes.title.to}"`);
        if (changes.confidence) historyChanges.push(`Confidence changed from ${changes.confidence.from}% to ${changes.confidence.to}%`);
        if (changes.risk) historyChanges.push(`Risk changed from ${changes.risk.from} to ${changes.risk.to}`);

        await DecisionHistory.create({
            decision_id: id,
            event_type: 'UPDATE',
            description: historyChanges.length > 0 ? historyChanges.join('; ') : 'Decision updated'
        });

        // Trigger health recalculation if confidence or dates changed
        if (current_confidence !== undefined || start_date || target_date) {
            await healthService.updateDecisionHealth(id);
        }

        // Trigger review intelligence  recalculation
        await reviewIntelligenceService.updateReviewIntelligence(id);

        // Auto-detect confidence-based conflicts on update
        if (current_confidence !== undefined) {
            try {
                console.log('[CONFLICT] Running automatic conflict detection after update...');
                const _cds = require('../services/conflictDetectionService');
                const conflicts = await _cds.detectAndInsertConfidenceConflicts(id);
                if (conflicts.length > 0) {
                    console.log(`[CONFLICT] ${conflicts.length} new conflict(s) detected`);
                }
            } catch (conflictError) {
                console.error('[CONFLICT] Failed to detect conflicts:', conflictError);
            }
        }

        res.json({ success: true, data: decision });
    } catch (err) {
        console.error('Update Decision Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDecision = async (req, res) => {
    try {
        console.log('[CREATE] Creating new decision...');

        // Governance Automation: High/Critical risk requires governance
        if (['High', 'Critical'].includes(req.body.risk_level)) {
            req.body.is_governance_required = true;
        }

        if (!req.body.lifecycle_state) {
            req.body.lifecycle_state = 'Active';
        }

        const decision = await Decision.create(req.body);
        console.log('[CREATE] Decision created:', decision.id, decision.title);

        await DecisionHistory.create({
            decision_id: decision.id,
            event_type: 'CREATED',
            description: 'Decision created via API'
        });

        // Initialize review intelligence with error handling
        try {
            console.log('[REVIEW] Calculating urgency score for new decision...');
            const reviewResult = await reviewIntelligenceService.updateReviewIntelligence(decision.id);
            console.log('[REVIEW] ✅ Score:', reviewResult.score, '| Next Review:', reviewResult.nextReviewDate);

            // Reload decision to get updated values
            await decision.reload();
        } catch (reviewError) {
            console.error('[REVIEW] ❌ Failed to calculate review intelligence:', reviewError);
            // Don't fail the request, but log the error
        }

        // Auto-detect confidence-based conflicts
        try {
            console.log('[CONFLICT] Running automatic conflict detection...');
            const _cds = require('../services/conflictDetectionService');
            const conflicts = await _cds.detectAndInsertConfidenceConflicts(decision.id);
            if (conflicts.length > 0) {
                console.log(`[CONFLICT] ${conflicts.length} conflict(s) detected and inserted`);
                await decision.reload();
            }
        } catch (conflictError) {
            console.error('[CONFLICT] Failed to detect conflicts:', conflictError);
        }

        // Auto-map decision to the default team so it appears in Team Space
        try {
            const defaultTeam = await Team.findOne();
            if (defaultTeam) {
                await DecisionTeamMap.findOrCreate({
                    where: { decision_id: decision.id, team_id: defaultTeam.id },
                    defaults: { decision_id: decision.id, team_id: defaultTeam.id }
                });
                console.log('[CREATE] Decision mapped to default team:', defaultTeam.name);
            }
        } catch (teamMapError) {
            console.error('[CREATE] Failed to map decision to team:', teamMapError.message);
        }

        res.status(201).json({ success: true, data: decision });
    } catch (err) {
        console.error('[CREATE] Error creating decision:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// Reaffirm Decision
exports.reaffirmDecision = async (req, res) => {
    try {
        const decision = await Decision.findByPk(req.params.id);
        if (!decision) {
            return res.status(404).json({ success: false, message: 'Decision not found' });
        }

        // Update last reviewed date
        await decision.update({ last_reviewed_at: new Date() });

        // Add history event
        await DecisionHistory.create({
            decision_id: decision.id,
            event_type: 'REAFFIRMED',
            description: 'Decision reaffirmed - confidence remains strong'
        });

        res.json({ success: true, message: 'Decision reaffirmed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Add Review Note
exports.addNote = async (req, res) => {
    try {
        const { note, review_tag } = req.body;
        if (!note) {
            return res.status(400).json({ success: false, message: 'Note is required' });
        }

        const decision = await Decision.findByPk(req.params.id);
        if (!decision) {
            return res.status(404).json({ success: false, message: 'Decision not found' });
        }

        // Add tag prefix if provided
        let finalNote = note;
        if (review_tag) {
            finalNote = `[${review_tag}] ${note}`;
        }

        // Add history event
        await DecisionHistory.create({
            decision_id: decision.id,
            event_type: 'NOTE',
            description: finalNote
        });

        res.json({ success: true, message: 'Note added' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Mark as Reviewed
exports.markReviewed = async (req, res) => {
    try {
        const decision = await Decision.findByPk(req.params.id);
        if (!decision) {
            return res.status(404).json({ success: false, message: 'Decision not found' });
        }

        const now = new Date();

        // Use provided review date or default to 90 days from now
        let nextReview;
        if (req.body.reviewDueDate) {
            nextReview = new Date(req.body.reviewDueDate);
        } else {
            nextReview = new Date(now);
            nextReview.setDate(nextReview.getDate() + 90);
        }

        // Update review dates
        await decision.update({
            last_reviewed_at: now,
            review_due_date: nextReview
        });

        // Add history event
        await DecisionHistory.create({
            decision_id: decision.id,
            event_type: 'REVIEWED',
            description: req.body.reviewDueDate
                ? `Marked as reviewed. Next review: ${nextReview.toLocaleDateString()}`
                : 'Marked as reviewed - next review in 90 days'
        });

        res.json({ success: true, message: 'Marked as reviewed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update Assumptions
exports.updateAssumptions = async (req, res) => {
    try {
        const { assumptions } = req.body;
        if (!assumptions || !Array.isArray(assumptions)) {
            return res.status(400).json({ success: false, message: 'Assumptions array is required' });
        }

        const decision = await Decision.findByPk(req.params.id);
        if (!decision) {
            return res.status(404).json({ success: false, message: 'Decision not found' });
        }

        // Delete existing assumptions
        await Assumption.destroy({ where: { decision_id: decision.id } });

        // Create new assumptions
        const newAssumptions = await Promise.all(
            assumptions.map(text =>
                Assumption.create({
                    decision_id: decision.id,
                    assumption_text: text,
                    is_active: true
                })
            )
        );

        // Add history event
        await DecisionHistory.create({
            decision_id: decision.id,
            event_type: 'UPDATE',
            description: `Assumptions updated (${assumptions.length} total)`
        });

        res.json({ success: true, data: newAssumptions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create Sub-Decision
exports.createSubDecision = async (req, res) => {
    try {
        const { parentId } = req.params;
        const { title, context, weight = 1, status = 'Pending' } = req.body;

        if (!parentId) return res.status(400).json({ success: false, message: 'Parent ID required' });

        // 1. Create Decision Record
        const decision = await Decision.create({
            title,
            context,
            decision_type: 'sub', // or SUB_DECISION
            parent_id: parentId,
            lifecycle_state: 'Active'
        });

        // 2. Create Tracking Record
        await require('../models').SubDecisionTracking.create({
            sub_decision_id: decision.id,
            weight,
            status,
            completion_percentage: status === 'Completed' ? 100 : 0
        });

        // 3. Recalculate Parent
        await require('../services/calculationService').recalculateMainDecision(parentId);

        res.status(201).json({ success: true, data: decision });

    } catch (err) {
        console.error('Create Sub Decision Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update Sub-Decision Progress
exports.updateProgress = async (req, res) => {
    try {
        const { id } = req.params; // Sub-decision ID
        const { completion_percentage, status, weight } = req.body;

        const tracking = await require('../models').SubDecisionTracking.findOne({ where: { sub_decision_id: id } });
        const decision = await Decision.findByPk(id);

        if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });

        if (!tracking) {
            // Create if missing (migration safety)
            await require('../models').SubDecisionTracking.create({
                sub_decision_id: id,
                completion_percentage: completion_percentage || 0,
                status: status || 'Pending',
                weight: weight || 1
            });
        } else {
            await tracking.update({
                completion_percentage: completion_percentage !== undefined ? completion_percentage : tracking.completion_percentage,
                status: status || tracking.status,
                weight: weight !== undefined ? weight : tracking.weight
            });
        }

        // Recalculate Parent
        if (decision.parent_id) {
            await require('../services/calculationService').recalculateMainDecision(decision.parent_id);
        }

        res.json({ success: true, message: 'Progress updated' });

    } catch (err) {
        console.error('Update Progress Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Helper for recursive deletion
const deleteDecisionRecursive = async (id, t) => {
    // 1. Find children
    const children = await Decision.findAll({ where: { parent_id: id }, transaction: t });
    for (const child of children) {
        await deleteDecisionRecursive(child.id, t);
    }

    // 2. Delete Dependencies
    await DecisionRelation.destroy({
        where: {
            [require('sequelize').Op.or]: [{ source_decision_id: id }, { target_decision_id: id }]
        },
        transaction: t
    });

    await require('../models').DecisionEdge.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').DecisionNode.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').SubDecisionTracking.destroy({ where: { sub_decision_id: id }, transaction: t });
    await DecisionHistory.destroy({ where: { decision_id: id }, transaction: t });
    await Assumption.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').DecisionReview.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').DecisionProgressHistory.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').AuditLog.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').DecisionTeamMap.destroy({ where: { decision_id: id }, transaction: t });

    // Additional cleanup for models I missed earlier
    await require('../models').Attachment.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').DecisionOption.destroy({ where: { decision_id: id }, transaction: t });
    await require('../models').DecisionVersion.destroy({ where: { decision_id: id }, transaction: t });

    // 3. Delete Decision
    await Decision.destroy({ where: { id: id }, transaction: t });
};

// Delete Decision
exports.deleteDecision = async (req, res) => {
    const t = await require('../models').sequelize.transaction();
    try {
        const { id } = req.params;
        const decision = await Decision.findByPk(id);

        if (!decision) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Decision not found' });
        }

        await deleteDecisionRecursive(id, t);

        await t.commit();
        res.json({ success: true, message: 'Decision and all sub-decisions deleted successfully' });

    } catch (err) {
        await t.rollback();
        console.error('Delete Decision Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- New Endpoint: Review Decision (Complete Review) ---
exports.reviewDecision = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, status = 'Completed', confidenceChanged = false, assumptionUpdated = false } = req.body;

        const decision = await Decision.findByPk(id);
        if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });

        // Get snapshot data for review history
        const conflictCount = await DecisionRelation.count({
            where: {
                [Op.or]: [
                    { source_decision_id: id },
                    { target_decision_id: id }
                ],
                relation_type: 'CONFLICT'
            }
        });
        const assumptionCount = await Assumption.count({ where: { decision_id: id } });

        // Detect shallow review
        const isShallowReview = reviewIntelligenceService.detectShallowReview({
            notes,
            confidenceChanged,
            assumptionUpdated
        });

        // Create Review Snapshot
        await require('../models').DecisionReviewHistory.create({
            decision_id: id,
            confidence_snapshot: decision.current_confidence,
            conflict_count_snapshot: conflictCount,
            assumption_count_snapshot: assumptionCount,
            review_notes: notes,
            reviewed_at: new Date(),
            is_shallow_review: isShallowReview
        });

        // If shallow review, increment postpone count
        if (isShallowReview) {
            await decision.update({
                postpone_count: decision.postpone_count + 1,
                last_reviewed_at: new Date()
            });
        } else {
            await decision.update({
                postpone_count: 0, // Reset on meaningful review
                last_reviewed_at: new Date()
            });
        }

        // Create Review Log (old system)
        await require('../models').DecisionReview.create({
            decision_id: id,
            review_date: new Date(),
            status,
            notes
        });

        // Trigger Health Update (confidence might boost)
        const newHealth = await healthService.updateDecisionHealth(id);

        // Trigger review intelligence update
        await reviewIntelligenceService.updateReviewIntelligence(id);

        res.json({ success: true, message: 'Review completed', data: newHealth });

    } catch (err) {
        console.error('Review Decision Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- New Endpoint: Trigger Daily Update (Simulation) ---
exports.triggerDailyUpdate = async (req, res) => {
    try {
        console.log('[Cron] Starting Daily Health Update...');
        const decisions = await Decision.findAll({ where: { parent_id: null } }); // Only Update Main Decisions (Cascade logic handles subs if needed, but health is mostly parent concept)

        const results = [];
        for (const decision of decisions) {
            console.log(`[Cron] Updating ${decision.title}...`);
            // Recalculate progress first (in case subs changed without trigger? Unlikely but safe)
            await require('../services/calculationService').recalculateMainDecision(decision.id);
            // Then Health
            const health = await healthService.updateDecisionHealth(decision.id);
            results.push({ id: decision.id, title: decision.title, health });
        }

        res.json({ success: true, message: 'Daily update completed', results });

    } catch (err) {
        console.error('Trigger Update Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDecisionById = async (req, res) => {
    try {
        console.log(`[API] Fetching decision with ID: ${req.params.id}`);

        const decision = await Decision.findByPk(req.params.id, {
            include: [
                { model: Assumption, as: 'assumptions' },
                { model: DecisionHistory, as: 'history' },
                { model: require('../models').AuditLog, as: 'auditLogs' },
                { model: require('../models').Team, as: 'team' },
                { model: Decision, as: 'parent' },
                { model: require('../models').SubDecisionTracking, as: 'tracking' },
                {
                    model: Decision,
                    as: 'children',
                    attributes: ['id', 'title', 'lifecycle_state', 'current_confidence', 'risk_level', 'progress_percentage', 'start_date', 'target_date', 'health_score'],
                    include: [{ model: require('../models').SubDecisionTracking, as: 'tracking' }]
                }
            ]
        });

        if (!decision) {
            return res.status(404).json({
                success: false,
                message: 'Decision not found'
            });
        }

        // Fetch History Graph Data
        const progressHistory = await require('../models').DecisionProgressHistory.findAll({
            where: { decision_id: decision.id },
            order: [['recorded_at', 'ASC']],
            limit: 30 // Last 30 points
        });

        // Fetch Reviews
        const reviews = await require('../models').DecisionReview.findAll({
            where: { decision_id: decision.id },
            order: [['review_date', 'DESC']]
        });

        // Dynamic Health Calc (Read-only check, doesn't update DB on GET usually, but good for real-time VIEW)
        // Note: For performance, we might just rely on stored fields, but let's calc for "Live" status
        const { healthScore, newHealthStatus, conflicts, logEvents, timeStatus } = await healthService.updateDecisionHealth(decision.id);

        res.json({
            success: true,
            data: {
                ...decision.toJSON(),
                calculated_confidence: decision.current_confidence,
                calculated_health: {
                    score: healthScore,
                    status: newHealthStatus,
                    time_status: timeStatus,
                    conflict_count: conflicts,
                    log_events: logEvents
                },
                progress_history: progressHistory,
                reviews: reviews
            }
        });
    } catch (err) {
        console.error('[API] Error fetching decision:', err.message);
        console.error('[API] Stack trace:', err.stack);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Edit a single Assumption (with versioning)
exports.editAssumption = async (req, res) => {
    try {
        const { id, assumptionId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Assumption text is required' });
        }

        const decision = await Decision.findByPk(id, {
            include: [{ model: Assumption, as: 'assumptions' }]
        });
        if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });

        const assumption = await Assumption.findByPk(assumptionId);
        if (!assumption || assumption.decision_id !== id) {
            return res.status(404).json({ success: false, message: 'Assumption not found' });
        }

        const oldText = assumption.assumption_text;

        // --- Versioning: snapshot before change ---
        const oldData = {
            title: decision.title,
            context: decision.context,
            current_confidence: decision.current_confidence,
            risk_level: decision.risk_level,
            lifecycle_state: decision.lifecycle_state,
            assumptions: (decision.assumptions || []).map(a => a.assumption_text)
        };

        const lastVersion = await DecisionVersion.findOne({
            where: { decision_id: id },
            order: [['version_number', 'DESC']]
        });
        const nextVersion = (lastVersion?.version_number || 0) + 1;

        await DecisionVersion.create({
            decision_id: id,
            version_number: nextVersion,
            snapshot_json: JSON.stringify(oldData),
            changed_fields_json: JSON.stringify({
                assumption_edited: { from: oldText, to: text.trim() }
            }),
            confidence_before: decision.current_confidence,
            confidence_after: decision.current_confidence,
            created_by: 'System'
        });

        // --- Perform the edit ---
        await assumption.update({ assumption_text: text.trim() });

        await DecisionHistory.create({
            decision_id: id,
            event_type: 'UPDATE',
            description: `Assumption edited: "${oldText}" → "${text.trim()}"`
        });

        res.json({ success: true, data: assumption });
    } catch (err) {
        console.error('Edit Assumption Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete a single Assumption (with versioning)
exports.deleteAssumption = async (req, res) => {
    try {
        const { id, assumptionId } = req.params;

        const decision = await Decision.findByPk(id, {
            include: [{ model: Assumption, as: 'assumptions' }]
        });
        if (!decision) return res.status(404).json({ success: false, message: 'Decision not found' });

        const assumption = await Assumption.findByPk(assumptionId);
        if (!assumption || assumption.decision_id !== id) {
            return res.status(404).json({ success: false, message: 'Assumption not found' });
        }

        const deletedText = assumption.assumption_text;

        // --- Versioning: snapshot before change ---
        const oldData = {
            title: decision.title,
            context: decision.context,
            current_confidence: decision.current_confidence,
            risk_level: decision.risk_level,
            lifecycle_state: decision.lifecycle_state,
            assumptions: (decision.assumptions || []).map(a => a.assumption_text)
        };

        const lastVersion = await DecisionVersion.findOne({
            where: { decision_id: id },
            order: [['version_number', 'DESC']]
        });
        const nextVersion = (lastVersion?.version_number || 0) + 1;

        await DecisionVersion.create({
            decision_id: id,
            version_number: nextVersion,
            snapshot_json: JSON.stringify(oldData),
            changed_fields_json: JSON.stringify({
                assumption_deleted: { text: deletedText }
            }),
            confidence_before: decision.current_confidence,
            confidence_after: decision.current_confidence,
            created_by: 'System'
        });

        // --- Perform the delete ---
        await assumption.destroy();

        await DecisionHistory.create({
            decision_id: id,
            event_type: 'UPDATE',
            description: `Assumption deleted: "${deletedText}"`
        });

        res.json({ success: true, message: 'Assumption deleted' });
    } catch (err) {
        console.error('Delete Assumption Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Review Alerts for Dashboard
exports.getReviewAlerts = async (req, res) => {
    console.log('[API] GET /api/decisions/alerts called');
    try {
        const decisions = await Decision.findAll({
            where: {
                [Op.or]: [
                    { review_escalation_level: { [Op.ne]: null } }, // Has escalation
                    {
                        review_urgency_score: { [Op.gte]: 40 }, // High enough urgency
                        next_review_date: { [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // Within 30 days
                    }
                ]
            },
            order: [
                // MySQL-compatible ordering
                [sequelize.literal('CASE WHEN review_escalation_level = "GOVERNANCE_RISK" THEN 3 WHEN review_escalation_level = "HIGH_PRIORITY" THEN 2 WHEN review_escalation_level = "REMINDER" THEN 1 ELSE 0 END'), 'DESC'],
                ['review_urgency_score', 'DESC']
            ],
            limit: 20
        });

        // Group by escalation level
        const alerts = {
            GOVERNANCE_RISK: [],
            HIGH_PRIORITY: [],
            REMINDER: [],
            upcoming: []
        };

        for (const decision of decisions) {
            // Get what changed
            const changes = await reviewIntelligenceService.getWhatChanged(decision.id);

            // Calculate days overdue
            let daysOverdue = null;
            if (decision.next_review_date && new Date() > new Date(decision.next_review_date)) {
                daysOverdue = Math.floor((new Date() - new Date(decision.next_review_date)) / (1000 * 60 * 60 * 24));
            }

            const alertData = {
                id: decision.id,
                title: decision.title,
                urgencyScore: decision.review_urgency_score,
                escalationLevel: decision.review_escalation_level,
                nextReviewDate: decision.next_review_date,
                daysOverdue,
                whatChanged: changes,
                riskLevel: decision.risk_level,
                impactLevel: decision.impact_level
            };

            if (decision.review_escalation_level) {
                alerts[decision.review_escalation_level].push(alertData);
            } else {
                alerts.upcoming.push(alertData);
            }
        }

        res.json({
            success: true,
            data: alerts,
            summary: {
                governanceRisk: alerts.GOVERNANCE_RISK.length,
                highPriority: alerts.HIGH_PRIORITY.length,
                reminder: alerts.REMINDER.length,
                upcoming: alerts.upcoming.length
            }
        });

    } catch (err) {
        console.error('Get Review Alerts Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Conflicts for a Decision
exports.getConflicts = async (req, res) => {
    try {
        const { id } = req.params;
        const cds = require('../services/conflictDetectionService');
        const conflicts = await cds.getConflictsForDecision(id);
        res.json({
            success: true,
            data: conflicts,
            count: conflicts.length
        });
    } catch (err) {
        console.error('Get Conflicts Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
