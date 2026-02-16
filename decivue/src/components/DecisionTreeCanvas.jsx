import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'

import DecisionNodeCard from './DecisionNodeCard'
import ConflictEdge from './ConflictEdge'
import DecisionSidePanel from './DecisionSidePanel'
import EditDecisionModal from './EditDecisionModal'
import { useDecisions } from '../hooks/useDecisions'
import { getRelatedCluster } from '../utils/treeHelpers'
import { ArrowLeft } from 'lucide-react'

const nodeTypes = {
    decision: DecisionNodeCard,
}

const edgeTypes = {
    conflict: ConflictEdge,
}

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = direction === 'LR'

    // Improved graph settings for better tree visualization
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 150,  // Increased vertical spacing between ranks
        nodesep: 100,   // Increased horizontal spacing between nodes at same level
        edgesep: 50,   // Spacing between edges
        marginx: 50,
        marginy: 50
    })

    // Increased node dimensions for better visibility
    const nodeWidth = 320
    const nodeHeight = 200

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    // Filter out conflict edges for layout
    const hierarchyEdges = edges.filter(edge => edge.type !== 'conflict')

    hierarchyEdges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    // Check if we have any hierarchy edges
    const hasHierarchy = hierarchyEdges.length > 0

    if (hasHierarchy) {
        // Use dagre layout for hierarchical structure
        dagre.layout(dagreGraph)

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id)
            return {
                ...node,
                targetPosition: isHorizontal ? 'left' : 'top',
                sourcePosition: isHorizontal ? 'right' : 'bottom',
                position: {
                    x: nodeWithPosition.x - nodeWidth / 2,  // Center horizontally
                    y: nodeWithPosition.y - nodeHeight / 2, // Center vertically
                },
            }
        })

        return { nodes: layoutedNodes, edges }
    } else {
        // No hierarchy - arrange nodes in a grid layout (3 columns)
        const nodesPerRow = 3
        const horizontalSpacing = nodeWidth + 100
        const verticalSpacing = nodeHeight + 150

        const layoutedNodes = nodes.map((node, index) => {
            const row = Math.floor(index / nodesPerRow)
            const col = index % nodesPerRow

            return {
                ...node,
                targetPosition: 'top',
                sourcePosition: 'bottom',
                position: {
                    x: col * horizontalSpacing + 50,
                    y: row * verticalSpacing + 50,
                },
            }
        })

        return { nodes: layoutedNodes, edges }
    }
}

function DecisionTreeFlow({ decisions: initialDecisions, initialFocusId }) {
    const { decisions: globalDecisions, addDecision } = useDecisions()

    // Use prop if available, otherwise fallback to hook
    const decisions = initialDecisions || globalDecisions;
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [selectedDecision, setSelectedDecision] = useState(null)

    const [searchParams] = useSearchParams()
    const focusId = initialFocusId || searchParams.get('focusId')

    const navigate = useNavigate()
    const { fitView, setCenter } = useReactFlow()

    // Transform data into nodes/edges
    useEffect(() => {
        if (!decisions.length) return

        let filteredDecisions = decisions

        // Special: If we are in Global Map mode (no initialDecisions)
        if (!initialDecisions) {
            if (!focusId) {
                // Global view: show ONLY root decisions and their relations
                filteredDecisions = filteredDecisions.filter(d => d.parentId === null || !d.parentId);
            } else {
                // Focused global view: show ONLY the cluster related to the focusId
                filteredDecisions = getRelatedCluster(focusId, decisions);
            }
        }

        // No filters applied - show all decisions

        const newNodes = filteredDecisions.map(d => ({
            id: d.id,
            type: 'decision',
            data: {
                decision: d,
                onAddChild: handleAddChild,
                onEdit: (decision) => setEditingDecision(decision)
            },
            position: { x: 0, y: 0 }, // Initial, will be layouted
            selected: d.id === focusId, // Highlight if focused
        }))

        const newEdges = []

        // Hierarchy Edges
        filteredDecisions.forEach(d => {
            if (d.parentId && filteredDecisions.find(p => p.id === d.parentId)) {
                newEdges.push({
                    id: `e${d.parentId}-${d.id}`,
                    source: d.parentId,
                    target: d.id,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: '#9ca3af', strokeWidth: 2 },
                })
            }
        })

        // General Relationship Edges
        const getRelationColor = (type) => {
            const colors = {
                'DEPENDS_ON': '#3b82f6', // blue-500
                'SUPPORTS': '#22c55e', // green-500
                'CONFLICTS_WITH': '#ef4444', // red-500
                'DERIVED_FROM': '#a855f7', // purple-500
                'SUB_DECISION': '#f97316', // orange-500
                'RELATES_TO': '#94a3b8' // slate-400
            };
            return colors[type] || '#94a3b8';
        };

        filteredDecisions.forEach(d => {
            // General Relationship Edges
            if (d.outgoingRelations && d.outgoingRelations.length > 0) {
                d.outgoingRelations.forEach(rel => {
                    // Property mapping (support both raw backend and potential future transformations)
                    const targetId = rel.target_decision_id || rel.targetDecisionId
                    const type = rel.relation_type || rel.relationType

                    // Skip if target not in current view
                    if (!filteredDecisions.find(target => target.id === targetId)) return

                    // Skip if it is a hierarchy relation we already handled via parentId
                    if (type === 'SUB_DECISION') return

                    // Show all conflicts

                    newEdges.push({
                        id: `rel-${rel.id}`,
                        source: d.id,
                        target: targetId,
                        label: type ? type.replace(/_/g, ' ') : 'RELATES TO',
                        type: type === 'CONFLICTS_WITH' ? 'conflict' : 'smoothstep',
                        animated: type === 'CONFLICTS_WITH',
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: getRelationColor(type)
                        },
                        style: {
                            stroke: getRelationColor(type),
                            strokeWidth: 2,
                            strokeDasharray: type === 'RELATES_TO' ? '5,5' : 'none'
                        },
                        labelStyle: { fontSize: 10, fontWeight: 700, fill: getRelationColor(type) },
                        labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
                        labelBgPadding: [4, 2],
                        labelBgBorderRadius: 4
                    })
                })
            }

            // Conflict Edges (Legacy support or if explicit conflict field used)
            if (d.conflict && d.conflict.withDecisionId && filteredDecisions.find(c => c.id === d.conflict.withDecisionId)) {
                // Avoid duplicate edges if already added by relations
                if (newEdges.find(e => e.id === `rel-${d.id}-${d.conflict.withDecisionId}` || e.id === `conflict-${d.id}-${d.conflict.withDecisionId}`)) return

                newEdges.push({
                    id: `conflict-legacy-${d.id}-${d.conflict.withDecisionId}`,
                    source: d.id,
                    target: d.conflict.withDecisionId,
                    type: 'conflict',
                    animated: true,
                    style: { stroke: '#ef4444', strokeWidth: 2 }
                })
            }
        })

        const layouted = getLayoutedElements(newNodes, newEdges)
        setNodes(layouted.nodes)
        setEdges(layouted.edges)

    }, [decisions])

    // Handle Focus
    useEffect(() => {
        if (focusId && nodes.length > 0) {
            const node = nodes.find(n => n.id === focusId)
            if (node) {
                // Center view on node
                setCenter(node.position.x + 140, node.position.y + 90, { zoom: 1, duration: 800 })
                setSelectedDecision(node.data.decision)
            }
        } else if (nodes.length > 0 && !focusId) {
            // Only fit view if not focusing and it's exact initial load (simple heuristic)
            setTimeout(() => fitView({ padding: 0.2 }), 50)
        }
    }, [focusId, nodes.length, setCenter, fitView])

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    )

    const handleNodeClick = useCallback((event, node) => {
        setSelectedDecision(node.data.decision)
    }, [])

    const handleNodeDoubleClick = useCallback((event, node) => {
        const id = node.id;
        navigate(`/tree?focusId=${id}`);
    }, [navigate])

    const handlePaneClick = useCallback(() => {
        setSelectedDecision(null)
    }, [])

    const handleLayout = useCallback(() => {
        const layouted = getLayoutedElements(nodes, edges)
        setNodes([...layouted.nodes])
        setEdges([...layouted.edges])
        fitView({ padding: 0.2, duration: 800 })
    }, [nodes, edges, fitView, setNodes, setEdges])

    const handleAddChild = useCallback((parentId) => {
        alert(`Add child for decision ${parentId} (Feature to be implemented linked to Create page)`)
    }, [])

    const { updateDecision } = useDecisions();
    const [editingDecision, setEditingDecision] = useState(null)

    const handleSidePanelAction = (action, id) => {
        if (action === 'edit') {
            setEditingDecision(selectedDecision)
            return
        }
        console.log('Action:', action, id)
        alert(`Action triggered: ${action} for ${id}`)
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </div>

            <div className="flex-1 relative h-full">

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    onPaneClick={handlePaneClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView={!focusId}
                    className="bg-gray-50"
                    minZoom={0.2}
                    maxZoom={1.5}
                >
                    <Controls className="bg-white border border-gray-200 shadow-sm !m-4" />
                    <MiniMap
                        nodeColor={(node) => {
                            switch (node.data.decision.healthStatus) {
                                case 'healthy': return '#bbf7d0';
                                case 'review': return '#fde68a';
                                case 'at-risk': return '#fecaca';
                                default: return '#e5e7eb';
                            }
                        }}
                        maskColor="rgba(243, 244, 246, 0.7)"
                        className="!bg-white !border !border-gray-200 !shadow-sm !m-4 !rounded-lg"
                    />
                    <Background color="#e5e7eb" gap={20} size={1} />
                </ReactFlow>

                <DecisionSidePanel
                    decision={selectedDecision}
                    onClose={() => setSelectedDecision(null)}
                    onAction={handleSidePanelAction}
                />
            </div>

            <EditDecisionModal
                isOpen={!!editingDecision}
                decision={editingDecision}
                onClose={() => setEditingDecision(null)}
                onUpdate={async (id, data) => {
                    await updateDecision(id, data);
                    setEditingDecision(null);
                    // Update current selected decision if it's the one we just edited
                    if (selectedDecision && selectedDecision.id === id) {
                        // The state in hook will update, but we might need to refresh local selection 
                        // if the reference changed
                    }
                }}
            />
        </div>
    )
}

export default function DecisionTreeCanvas(props) {
    return (
        <ReactFlowProvider>
            <DecisionTreeFlow {...props} />
        </ReactFlowProvider>
    )
}
