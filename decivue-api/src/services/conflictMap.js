/**
 * Hardcoded Conflict Map (Demo / Presentation Layer)
 * 
 * Maps confidence scores to arrays of conflicting confidence scores.
 * Bi-directional: if 63 conflicts with 75, then 75 also conflicts with 63.
 * 
 * Used by conflictDetectionService to auto-detect conflicts
 * between decisions based on their confidence scores.
 */

const conflictMap = {
    63: [75],
    75: [63],
    42: [88],
    88: [42],
    55: [21],
    21: [55],
    90: [33],
    33: [90]
};

module.exports = conflictMap;
