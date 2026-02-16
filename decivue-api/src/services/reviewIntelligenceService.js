const { Decision, DecisionReviewHistory, DecisionRelation, Assumption } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculate Review Urgency Score (0-100)
 * Higher score = review sooner
 */
exports.calculateReviewScore = async (decision) => {
    let score = 0;

    // 1. Risk Weight
    if (decision.impact_level === 'High') score += 20;
    if (decision.impact_level === 'Critical') score += 25;
    if (decision.priority_level === 'HIGH') score += 15;
    if (decision.priority_level === 'CRITICAL') score += 25;

    // 2. Conflict Weight
    const conflictCount = await DecisionRelation.count({
        where: {
            [Op.or]: [
                { source_decision_id: decision.id },
                { target_decision_id: decision.id }
            ],
            relation_type: 'CONFLICT'
        }
    });
    score += conflictCount * 10;

    // 3. Confidence Drop Weight
    const confidenceDrop = decision.initial_confidence - decision.current_confidence;
    if (confidenceDrop > 15) score += 15;

    // 4. Old Assumptions Weight
    const assumptions = await Assumption.findAll({
        where: { decision_id: decision.id }
    });
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oldAssumptions = assumptions.filter(a => new Date(a.created_at) < ninetyDaysAgo);
    if (oldAssumptions.length > 2) score += 10;

    // 5. Overdue Weight
    if (decision.next_review_date && new Date() > new Date(decision.next_review_date)) {
        score += 20;
    }

    return Math.min(score, 100);
};

/**
 * Calculate Next Review Date based on score
 */
exports.calculateNextReviewDate = (score) => {
    const now = new Date();
    let daysToAdd;

    if (score >= 80) daysToAdd = 3;
    else if (score >= 60) daysToAdd = 7;
    else if (score >= 40) daysToAdd = 14;
    else daysToAdd = 30;

    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
    return nextReviewDate;
};

/**
 * Calculate Escalation Level based on days overdue
 */
exports.calculateEscalationLevel = (daysOverdue) => {
    if (daysOverdue >= 8) return 'GOVERNANCE_RISK';
    if (daysOverdue >= 4) return 'HIGH_PRIORITY';
    if (daysOverdue >= 1) return 'REMINDER';
    return null;
};

/**
 * Detect Shallow Review
 * Returns true if review is shallow (click without meaningful action)
 */
exports.detectShallowReview = (reviewData) => {
    const { notes, confidenceChanged, assumptionUpdated } = reviewData;

    const hasShortNotes = !notes || notes.length < 20;
    const noConfidenceChange = !confidenceChanged;
    const noAssumptionUpdate = !assumptionUpdated;

    return hasShortNotes && noConfidenceChange && noAssumptionUpdate;
};

/**
 * Get What Changed Since Last Review
 * Compares current state vs last snapshot
 */
exports.getWhatChanged = async (decisionId, lastReviewDate) => {
    const changes = [];

    // Get last review snapshot
    const lastReview = await DecisionReviewHistory.findOne({
        where: { decision_id: decisionId },
        order: [['reviewed_at', 'DESC']]
    });

    if (!lastReview) {
        return ['No previous review available'];
    }

    // Get current decision
    const decision = await Decision.findByPk(decisionId);

    // 1. Confidence changes
    if (decision.current_confidence !== lastReview.confidence_snapshot) {
        const diff = decision.current_confidence - lastReview.confidence_snapshot;
        changes.push(`Confidence ${diff > 0 ? 'increased' : 'dropped'} from ${lastReview.confidence_snapshot}% → ${decision.current_confidence}%`);
    }

    // 2. Conflict changes
    const currentConflictCount = await DecisionRelation.count({
        where: {
            [Op.or]: [
                { source_decision_id: decisionId },
                { target_decision_id: decisionId }
            ],
            relation_type: 'CONFLICT'
        }
    });

    if (currentConflictCount !== lastReview.conflict_count_snapshot) {
        const diff = currentConflictCount - lastReview.conflict_count_snapshot;
        if (diff > 0) {
            changes.push(`${diff} new conflict${diff > 1 ? 's' : ''} detected`);
        } else {
            changes.push(`${Math.abs(diff)} conflict${Math.abs(diff) > 1 ? 's' : ''} resolved`);
        }
    }

    // 3. Assumption changes
    const currentAssumptionCount = await Assumption.count({
        where: { decision_id: decisionId }
    });

    if (currentAssumptionCount !== lastReview.assumption_count_snapshot) {
        const diff = currentAssumptionCount - lastReview.assumption_count_snapshot;
        if (diff > 0) {
            changes.push(`${diff} new assumption${diff > 1 ? 's' : ''} added`);
        } else {
            changes.push(`${Math.abs(diff)} assumption${Math.abs(diff) > 1 ? 's' : ''} removed`);
        }
    }

    // 4. Check for old assumptions
    const assumptions = await Assumption.findAll({
        where: { decision_id: decisionId }
    });
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oldAssumptions = assumptions.filter(a => new Date(a.created_at) < ninetyDaysAgo);
    if (oldAssumptions.length > 0) {
        changes.push(`${oldAssumptions.length} assumption${oldAssumptions.length > 1 ? 's' : ''} older than 90 days`);
    }

    return changes.length > 0 ? changes : ['No significant changes'];
};

/**
 * Update Decision Review Intelligence
 * Call this whenever: conflict changes, confidence changes, review completed, or daily cron
 */
exports.updateReviewIntelligence = async (decisionId) => {
    const decision = await Decision.findByPk(decisionId);
    if (!decision) throw new Error('Decision not found');

    // Calculate new score
    const score = await exports.calculateReviewScore(decision);

    // Calculate next review date
    const nextReviewDate = exports.calculateNextReviewDate(score);

    // Calculate escalation if overdue
    let escalationLevel = null;
    if (decision.next_review_date) {
        const daysOverdue = Math.floor((new Date() - new Date(decision.next_review_date)) / (1000 * 60 * 60 * 24));
        if (daysOverdue > 0) {
            escalationLevel = exports.calculateEscalationLevel(daysOverdue);
        }
    }

    // Update decision
    await decision.update({
        review_urgency_score: score,
        next_review_date: nextReviewDate,
        review_escalation_level: escalationLevel
    });

    return {
        score,
        nextReviewDate,
        escalationLevel
    };
};
