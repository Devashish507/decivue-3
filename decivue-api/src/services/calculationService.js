const { Decision, SubDecisionTracking } = require('../models');

exports.recalculateMainDecision = async (parentId) => {
    try {
        if (!parentId) return;

        console.log(`[Calculation] Recalculating for parent: ${parentId}`);

        // 1. Fetch all sub-decisions with their tracking info
        const subDecisions = await Decision.findAll({
            where: {
                parent_id: parentId
            },
            include: [{
                model: SubDecisionTracking,
                as: 'tracking'
            }]
        });

        if (!subDecisions || subDecisions.length === 0) {
            console.log('[Calculation] No sub-decisions found.');
            return;
        }

        // 2. Calculate Weighted Progress
        let totalWeight = 0;
        let weightedProgressSum = 0;
        let completedCount = 0;
        let inProgressCount = 0;
        let conflictsCount = 0; // Simple placeholder, real logic might need Relation check

        for (const sub of subDecisions) {
            const tracking = sub.tracking || { weight: 1, completion_percentage: 0, status: 'Pending' }; // Default if missing

            totalWeight += tracking.weight;
            weightedProgressSum += (tracking.completion_percentage * tracking.weight);

            if (tracking.status === 'Completed') completedCount++;
            if (tracking.status === 'In Progress') inProgressCount++;
            // if (sub.risk_level === 'High') conflictsCount++; // Example proxy
        }

        const mainProgress = totalWeight > 0 ? (weightedProgressSum / totalWeight) : 0;

        // 3. Calculate Confidence (Simple Heuristic for now)
        // Base 50 + (Completed * 5) - (In Progress * 2)
        // Clamp 0-100
        let newConfidence = 50 + (completedCount * 10) + (inProgressCount * 2);
        if (newConfidence > 100) newConfidence = 100;
        if (newConfidence < 0) newConfidence = 0;

        // 4. Determine Lifecycle State
        let newLifecycle = 'Active';
        if (mainProgress === 0) newLifecycle = 'Draft';
        else if (mainProgress >= 100) newLifecycle = 'Closed'; // or Stable
        else if (mainProgress > 80) newLifecycle = 'Stable';

        // 5. Update Parent Decision
        await Decision.update({
            progress_percentage: parseFloat(mainProgress.toFixed(1)),
            current_confidence: Math.round(newConfidence),
            lifecycle_state: newLifecycle
        }, {
            where: { id: parentId }
        });

        // 6. Trigger Health Engine Update
        // Recalculate health based on new progress and time
        await require('./healthService').updateDecisionHealth(parentId);

        console.log(`[Calculation] Updated Parent ${parentId}: Progress=${mainProgress.toFixed(1)}%, Conf=${newConfidence}, State=${newLifecycle}`);

        return {
            progress: mainProgress,
            confidence: newConfidence,
            lifecycle: newLifecycle
        };

    } catch (error) {
        console.error('[Calculation] Error recalculating main decision:', error);
        throw error;
    }
};
