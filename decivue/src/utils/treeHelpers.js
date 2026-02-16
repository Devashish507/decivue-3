/**
 * Recursive function to find all unique descendants of a given decision ID.
 */
export function getDescendants(rootId, allDecisions) {
    const root = allDecisions.find(d => d.id === rootId)
    if (!root) return []

    let descendants = [root]

    const children = allDecisions.filter(d => d.parentId === rootId)

    children.forEach(child => {
        const childDescendants = getDescendants(child.id, allDecisions)
        descendants = [...descendants, ...childDescendants]
    })

    // Remove duplicates
    const uniqueMap = new Map();
    descendants.forEach(d => uniqueMap.set(d.id, d));
    return Array.from(uniqueMap.values());
}

/**
 * Finds all unique decisions related to a root decision, following both
 * parent/child hierarchy and general relationships (outgoing).
 */
export function getRelatedCluster(rootId, allDecisions, visited = new Set()) {
    if (visited.has(rootId)) return [];
    visited.add(rootId);

    const root = allDecisions.find(d => d.id === rootId);
    if (!root) return [];

    let cluster = [root];

    // Follow Hierarchy (Children)
    const children = allDecisions.filter(d => d.parentId === rootId);
    children.forEach(child => {
        cluster = [...cluster, ...getRelatedCluster(child.id, allDecisions, visited)];
    });

    // Follow Relations (Outgoing)
    if (root.outgoingRelations) {
        root.outgoingRelations.forEach(rel => {
            cluster = [...cluster, ...getRelatedCluster(rel.target_decision_id, allDecisions, visited)];
        });
    }

    // Follow Relations (Incoming)
    if (root.incomingRelations) {
        root.incomingRelations.forEach(rel => {
            cluster = [...cluster, ...getRelatedCluster(rel.source_decision_id, allDecisions, visited)];
        });
    }

    // Follow Parent (Upwards)
    if (root.parentId) {
        cluster = [...cluster, ...getRelatedCluster(root.parentId, allDecisions, visited)];
    }

    // Deduplicate
    const uniqueMap = new Map();
    cluster.forEach(d => uniqueMap.set(d.id, d));
    return Array.from(uniqueMap.values());
}
