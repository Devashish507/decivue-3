import React, { useMemo } from 'react'
import DecisionTreeCanvas from './DecisionTreeCanvas'
import { useDecisions } from '../hooks/useDecisions'
import { getRelatedCluster } from '../utils/treeHelpers'

export default function DecisionTreeContainer({ decisionId }) {
    const { decisions } = useDecisions()

    const treeData = useMemo(() => {
        if (!decisionId || !decisions.length) return []
        return getRelatedCluster(decisionId, decisions)
    }, [decisionId, decisions])

    if (!treeData.length) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                <p className="mb-2">No decision tree data found.</p>
                <p className="text-xs">This decision might be isolated or deleted.</p>
            </div>
        )
    }

    return (
        <div className="relative h-[600px] border border-gray-200 rounded-xl shadow-sm bg-gray-50">
            <DecisionTreeCanvas decisions={treeData} initialFocusId={decisionId} />
        </div>
    )
}
