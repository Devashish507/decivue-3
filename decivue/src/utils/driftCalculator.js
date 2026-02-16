export const calculateDrift = (currentDecision, originalVersion) => {
    if (!currentDecision || !originalVersion) {
        return { score: 0, status: 'ON TRACK', details: [] };
    }

    let original;
    try {
        original = typeof originalVersion.snapshot_json === 'string'
            ? JSON.parse(originalVersion.snapshot_json)
            : originalVersion.snapshot_json;
    } catch (e) {
        console.error('Error parsing snapshot_json:', e);
        return { score: 0, status: 'ERROR', details: ['Invalid version data'] };
    }

    if (!original) {
        return { score: 0, status: 'ON TRACK', details: [] };
    }

    let score = 0;
    const details = [];

    console.log('--- DRIFT CALCULATION DEBUG ---');
    console.log('Current Decision:', currentDecision);
    console.log('Original Snapshot (Parsed):', original);

    // 1. Objective (Title) Change
    // Handle both 'title' and 'statement' as keys depending on API consistency
    const currentTitle = (currentDecision.title || currentDecision.statement || '').trim();
    const originalTitle = (original.title || original.statement || '').trim();

    console.log(`Comparing Title: "${currentTitle}" vs "${originalTitle}"`);

    if (currentTitle !== originalTitle) {
        score += 3;
        details.push('Objective (Title) has changed');
    }

    // 2. Assumptions Change
    // Compare assumptions lists.
    // Assumptions might be array of objects or strings. Normalize to strings.
    const getAssumptionTexts = (list) => {
        if (!Array.isArray(list)) return [];
        return list.map(a => {
            if (typeof a === 'string') return a.trim();
            return (a.assumption_text || a.text || '').trim();
        }).filter(t => t.length > 0);
    };

    const currentAssumptions = getAssumptionTexts(currentDecision.assumptions);
    const originalAssumptions = getAssumptionTexts(original.assumptions);

    console.log('Assumptions:', currentAssumptions, originalAssumptions);

    // Simple difference count: symmetric difference or just count changes?
    // "Count assumption differences: +1 per changed/removed/added assumption"
    // Heuristic: Set of all unique assumptions. Count mismatch.

    const currentSet = new Set(currentAssumptions);
    const originalSet = new Set(originalAssumptions);

    let assumptionDiffCount = 0;

    // Count specific adds/removes to be precise, but user wants max +3
    // We can just iterate and see how many don't match.

    // Items in current not in original (Added/Changed)
    currentSet.forEach(txn => {
        if (!originalSet.has(txn)) assumptionDiffCount++;
    });

    // Items in original not in current (Removed)
    originalSet.forEach(txn => {
        if (!currentSet.has(txn)) assumptionDiffCount++;
    });

    const assumptionScore = Math.min(assumptionDiffCount, 3);
    if (assumptionScore > 0) {
        score += assumptionScore;
        details.push(`${assumptionDiffCount} assumption(s) changed, added, or removed`);
    }

    // 3. Priority Change
    const currentPriority = (currentDecision.priority_level || currentDecision.priorityLevel || 'MEDIUM').toUpperCase();
    const originalPriority = (original.priority_level || original.priorityLevel || 'MEDIUM').toUpperCase();

    if (currentPriority !== originalPriority) {
        score += 2;
        details.push(`Priority changed from ${originalPriority} to ${currentPriority}`);
    }

    // 4. Impact Level Change
    const currentImpact = (currentDecision.impact_level || currentDecision.impactLevel || 'MEDIUM').toUpperCase();
    const originalImpact = (original.impact_level || original.impactLevel || 'MEDIUM').toUpperCase();

    if (currentImpact !== originalImpact) {
        score += 2;
        details.push(`Impact level changed from ${originalImpact} to ${currentImpact}`);
    }

    // 5. Context Change
    const currentContext = (currentDecision.context || '').trim();
    const originalContext = (original.context || '').trim();

    if (currentContext !== originalContext) {
        score += 1;
        details.push('Context description has been modified');
    }

    // Classification
    let status = 'ON TRACK';
    if (score >= 6) {
        status = 'SIGNIFICANTLY DRIFTED';
    } else if (score >= 3) {
        status = 'SLIGHTLY DRIFTED';
    }

    return {
        score,
        status,
        details
    };
};
