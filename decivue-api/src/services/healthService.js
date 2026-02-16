const { Decision, DecisionRelation, Assumption, DecisionHistory, DecisionVersion } = require('../models');
const { Op } = require('sequelize');

class HealthService {

    async updateDecisionHealth(decisionId) {
        try {
            const decision = await Decision.findByPk(decisionId, {
                include: [
                    { model: require('../models').SubDecisionTracking, as: 'tracking' }, // For sub-decisions
                    { model: Decision, as: 'children' }
                ]
            });

            if (!decision) return null;

            let logEvents = [];
            // Use initial_confidence as the BASE to avoid cumulative penalty drift on every recalculation
            let currentConfidence = decision.initial_confidence || decision.current_confidence || 50;
            let currentHealth = decision.health_score;

            // --- 1. Calculate Time Progress ---
            let timeProgress = 0;
            if (decision.start_date && decision.target_date) {
                const totalDuration = new Date(decision.target_date) - new Date(decision.start_date);
                const elapsed = new Date() - new Date(decision.start_date);
                if (totalDuration > 0) {
                    timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                }
            }

            // --- 2. Calculate Health Score ---
            // Formula: 100 - (Lag * 20) - (Overdue Subs * 10) - (Decay)
            let healthDeductions = 0;

            // Lag Deduction
            // If Execution < Time Progress by more than 10%, deduct points
            // Assuming decision.progress_percentage is up to date (via CalculationService)
            let lag = 0;
            if (timeProgress > decision.progress_percentage + 10) {
                lag = (timeProgress - decision.progress_percentage) / 100; // e.g., 0.2 for 20% lag
                healthDeductions += (lag * 20); // Max 20 points for full lag
                logEvents.push(`Health -${(lag * 20).toFixed(1)}: Behind schedule`);
            }

            // Overdue Reviews Deduction
            const overdueReviews = await require('../models').DecisionReview.count({
                where: {
                    decision_id: decisionId,
                    status: 'Overdue'
                }
            });
            if (overdueReviews > 0) {
                healthDeductions += (overdueReviews * 10);
                logEvents.push(`Health -${overdueReviews * 10}: ${overdueReviews} overdue review(s)`);
            }

            // Confidence Drop Deduction
            if (currentConfidence < 50) {
                healthDeductions += 5;
                logEvents.push(`Health -5: Low confidence`);
            }

            let newHealthScore = Math.max(0, Math.min(100, 100 - healthDeductions));


            // --- 3. Confidence Decay (Time-based) ---
            // If no review in 30 days -> -5%
            // If Time Lag > 20% -> -10%

            if (decision.last_reviewed_at) {
                const daysSinceReview = Math.floor((new Date() - new Date(decision.last_reviewed_at)) / (1000 * 60 * 60 * 24));
                if (daysSinceReview > 30) {
                    currentConfidence -= 5;
                    logEvents.push('Confidence -5: No review in 30 days');
                }
            } else {
                // Never reviewed and old?
                if (decision.created_at && (new Date() - new Date(decision.created_at)) > (30 * 24 * 60 * 60 * 1000)) {
                    currentConfidence -= 5;
                    logEvents.push('Confidence -5: No initial review');
                }
            }

            if (timeProgress > decision.progress_percentage + 20) {
                currentConfidence -= 10;
                logEvents.push('Confidence -10: Significant delay (>20%)');
            }

            // --- 4. Determine Lifecycle State & Status ---
            // Statuses: On Track, Behind Schedule, At Risk, Completed
            let timeStatus = 'On Track';
            if (decision.progress_percentage >= 100) {
                timeStatus = 'Completed';
            } else if (newHealthScore < 40) {
                timeStatus = 'At Risk';
            } else if (timeProgress > decision.progress_percentage + 10) {
                timeStatus = 'Behind Schedule';
            }

            // --- 5. Validating Conflicts (Legacy check) ---
            const conflicts = await DecisionRelation.count({
                where: {
                    [Op.or]: [{ source_decision_id: decisionId }, { target_decision_id: decisionId }],
                    relation_type: 'CONFLICTS_WITH'
                }
            });
            if (conflicts > 0) {
                currentConfidence -= (conflicts * 2); // Minor penalty
                logEvents.push(`Confidence -${conflicts * 2}: Active conflicts`);
            }

            // --- 6. Final Confidence Cap ---
            currentConfidence = Math.max(0, Math.min(100, currentConfidence));


            // --- 7. Version Tracking (only if confidence actually changed) ---
            const storedConfidence = decision.current_confidence;
            const finalConfidence = Math.round(currentConfidence);

            if (storedConfidence !== finalConfidence) {
                try {
                    const lastVersion = await DecisionVersion.findOne({
                        where: { decision_id: decisionId },
                        order: [['version_number', 'DESC']]
                    });
                    const nextVersion = (lastVersion?.version_number || 0) + 1;

                    await DecisionVersion.create({
                        decision_id: decisionId,
                        version_number: nextVersion,
                        snapshot_json: JSON.stringify({
                            title: decision.title,
                            context: decision.context,
                            current_confidence: storedConfidence,
                            risk_level: decision.risk_level,
                            lifecycle_state: decision.lifecycle_state
                        }),
                        changed_fields_json: JSON.stringify({
                            current_confidence: { from: storedConfidence, to: finalConfidence },
                            reason: logEvents.filter(e => e.startsWith('Confidence')).join('; ') || 'Health engine recalculation'
                        }),
                        confidence_before: storedConfidence,
                        confidence_after: finalConfidence,
                        created_by: 'Health Engine'
                    });
                } catch (vErr) {
                    console.error('[HealthService] Version tracking error:', vErr.message);
                }
            }

            // --- 8. Save Updates ---
            await decision.update({
                health_score: parseFloat(newHealthScore.toFixed(1)),
                current_confidence: finalConfidence,
                last_progress_update: new Date()
            });

            // --- 7. Log History ---
            await require('../models').DecisionProgressHistory.create({
                decision_id: decisionId,
                recorded_progress: decision.progress_percentage,
                recorded_confidence: currentConfidence,
                recorded_health: newHealthScore
            });

            console.log(`[HealthEngine] Decision ${decisionId}: Health=${newHealthScore.toFixed(1)}, Conf=${currentConfidence}, Status=${timeStatus}`);

            return {
                healthScore: newHealthScore,
                confidence: currentConfidence,
                timeStatus,
                logEvents
            };

        } catch (error) {
            console.error('[HealthService] Error updating health:', error);
            const fs = require('fs');
            fs.appendFileSync('api_errors.log', `${new Date().toISOString()} - HealthService Error: ${error.stack}\n`);
            throw error;
        }
    }

    // Legacy method wrapper if needed, or replace usages
    async calculateHealth(decision) {
        return this.updateDecisionHealth(decision.id);
    }
}

module.exports = new HealthService();
