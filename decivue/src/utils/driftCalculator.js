/**
 * Decision Drift Calculator
 * Compares current decision state against original version (v1).
 * Read-only — no DB or API changes.
 */

const normalize = (text) => {
    return (text || '').trim().toLowerCase();
};

export const calculateDrift = (currentDecision, originalVersion) => {
    if (!currentDecision || !originalVersion) {
        return { status: 'ON_TRACK', reasons: [] };
    }

    let original;
    try {
        original = typeof originalVersion.snapshot_json === 'string'
            ? JSON.parse(originalVersion.snapshot_json)
            : originalVersion.snapshot_json;
    } catch (e) {
        return { status: 'ON_TRACK', reasons: [] };
    }

    if (!original) {
        return { status: 'ON_TRACK', reasons: [] };
    }

    const drift_reasons = [];

    // 1. Objective (title/statement)
    const currentObjective = normalize(currentDecision.title || currentDecision.statement);
    const originalObjective = normalize(original.title || original.statement);
    if (currentObjective !== originalObjective) {
        drift_reasons.push('Objective changed');
    }

    // 2. Priority
    const currentPriority = currentDecision.priority_level || currentDecision.priorityLevel || '';
    const originalPriority = original.priority_level || original.priorityLevel || '';
    if (currentPriority !== originalPriority) {
        drift_reasons.push(`Priority changed from ${originalPriority || 'N/A'} to ${currentPriority || 'N/A'}`);
    }

    // 3. Impact
    const currentImpact = currentDecision.impact_level || currentDecision.impactLevel || '';
    const originalImpact = original.impact_level || original.impactLevel || '';
    if (currentImpact !== originalImpact) {
        drift_reasons.push('Impact level changed');
    }

    // 4. Assumptions
    const getAssumptionTexts = (list) => {
        if (!Array.isArray(list)) return [];
        return list.map(a => {
            if (typeof a === 'string') return a.trim();
            return (a.assumption_text || a.text || '').trim();
        }).filter(t => t.length > 0);
    };
    const currentAssumptions = getAssumptionTexts(currentDecision.assumptions);
    const originalAssumptions = getAssumptionTexts(original.assumptions);

    // Simple stringify comparison of sorted arrays
    if (JSON.stringify(currentAssumptions.sort()) !== JSON.stringify(originalAssumptions.sort())) {
        drift_reasons.push('Assumptions updated');
    }

    // 5. Context
    if (normalize(currentDecision.context) !== normalize(original.context)) {
        drift_reasons.push('Context modified');
    }

    return {
        status: drift_reasons.length === 0 ? 'ON_TRACK' : 'DRIFT_DETECTED',
        reasons: drift_reasons
    };
};
