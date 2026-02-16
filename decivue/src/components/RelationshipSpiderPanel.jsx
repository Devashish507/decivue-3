import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { decisionService } from '../services/api';

export default function RelationshipSpiderPanel({ decisionId, currentDecisionTitle }) {
    const svgRef = useRef(null);
    const [relationships, setRelationships] = useState({ outgoing: [], incoming: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadRelationships();
    }, [decisionId]);

    const loadRelationships = async () => {
        try {
            setLoading(true);
            const response = await decisionService.getRelationships(decisionId);
            setRelationships(response.data || { outgoing: [], incoming: [] });
        } catch (err) {
            console.error('Error loading relationships:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading || (!relationships.outgoing.length && !relationships.incoming.length)) return;
        renderGraph();
    }, [relationships, loading]);

    const renderGraph = () => {
        if (!svgRef.current) return;

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        // Clear previous SVG
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        // Define arrow markers
        const defs = svg.append("defs");

        ["DEPENDS_ON", "SUPPORTS", "CONFLICTS_WITH", "DERIVED_FROM", "SUB_DECISION", "RELATES_TO"].forEach(type => {
            defs.append("marker")
                .attr("id", `arrow-${type}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 28) // Position of arrow relative to node radius (r=25 + gap)
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("fill", getColor(type))
                .attr("d", "M0,-5L10,0L0,5");
        });

        // Prepare nodes and links
        const nodes = [
            { id: "current", title: currentDecisionTitle || "Current Decision", type: "current", r: 30 }
        ];

        const links = [];

        // Add PARENT node
        if (relationships.parent) {
            nodes.push({
                id: relationships.parent.id,
                title: relationships.parent.title,
                type: "parent",
                category: "Strategic", // Default or fetch if avail
                r: 25,
                // Optional: Pre-set position for parent (Top) if we want to guide the force layout
                // fy: height / 2 - 150 
            });
            links.push({
                source: relationships.parent.id, // Parent -> Current
                target: "current",
                type: "DERIVED_FROM",
                label: "DERIVED FROM"
            });
        }

        // Add CHILDREN nodes
        if (relationships.children) {
            relationships.children.forEach(child => {
                if (!nodes.find(n => n.id === child.id)) {
                    nodes.push({
                        id: child.id,
                        title: child.title,
                        type: "child",
                        category: "Operational",
                        r: 20
                    });
                    links.push({
                        source: "current", // Current -> Child
                        target: child.id,
                        type: "SUB_DECISION",
                        label: "SUB DECISION"
                    });
                }
            });
        }

        // Add outgoing nodes
        relationships.outgoing.forEach((rel) => {
            // Check if node already exists
            if (!nodes.find(n => n.id === rel.decision.id)) {
                nodes.push({
                    id: rel.decision.id,
                    title: rel.decision.statement || rel.decision.title || "Untitled Decision",
                    type: "target",
                    category: rel.decision.category,
                    r: 20
                });
            }
            links.push({
                source: "current",
                target: rel.decision.id,
                type: rel.relation_type,
                label: rel.relation_type?.replace(/_/g, ' ') || 'RELATES TO'
            });
        });

        // Add incoming nodes
        relationships.incoming.forEach((rel) => {
            // Check if node already exists
            if (!nodes.find(n => n.id === rel.decision.id)) {
                nodes.push({
                    id: rel.decision.id,
                    title: rel.decision.statement || rel.decision.title || "Untitled Decision",
                    type: "source",
                    category: rel.decision.category,
                    r: 20
                });
            }
            links.push({
                source: rel.decision.id,
                target: "current",
                type: rel.relation_type,
                label: rel.relation_type?.replace(/_/g, ' ') || 'RELATES TO'
            });
        });

        // Simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => d.r + 20));

        // Draw lines (links)
        const link = svg.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", d => getColor(d.type))
            .attr("stroke-width", 2)
            .attr("marker-end", d => `url(#arrow-${d.type})`)
            .attr("stroke-opacity", 0.6);

        // Link labels background
        const linkLabelBg = svg.append("g")
            .selectAll("rect")
            .data(links)
            .join("rect")
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", "white")
            .attr("fill-opacity", 0.8);

        // Link labels
        const linkLabel = svg.append("g")
            .selectAll("text")
            .data(links)
            .join("text")
            .text(d => d.label)
            .attr("font-size", "8px")
            .attr("fill", "#64748b")
            .attr("text-anchor", "middle")
            .attr("dy", 3);

        // Draw nodes
        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Node circles
        node.append("circle")
            .attr("r", d => d.r)
            .attr("fill", d => d.type === "current" ? "#2563eb" : "#ffffff")
            .attr("stroke", d => d.type === "current" ? "#1d4ed8" : getColor(d.type === 'current' ? 'DEPENDS_ON' : 'RELATES_TO'))
            .attr("stroke-width", d => d.type === "current" ? 0 : 2)
            .style("cursor", "pointer")
            .style("filter", "drop-shadow(0px 2px 2px rgba(0,0,0,0.1))")
            .on("click", (event, d) => {
                if (d.id !== "current") {
                    navigate(`/decisions/${d.id}/focus`);
                }
            });

        // Node labels
        node.append("text")
            .text(d => {
                const title = d.title || "Untitled";
                return title.length > 15 ? title.substring(0, 13) + '...' : title;
            })
            .attr("x", 0)
            .attr("y", d => d.r + 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("font-weight", d => d.type === "current" ? "bold" : "normal")
            .attr("fill", "#334155")
            .style("pointer-events", "none");

        // Icons inside nodes
        node.append("text")
            .text(d => d.type === 'current' ? '★' : '')
            .attr("dy", 5)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "16px")
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);

            // Position link labels at midpoint
            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            // Position link label backgrounds
            linkLabelBg
                .attr("x", d => (d.source.x + d.target.x) / 2 - 20)
                .attr("y", d => (d.source.y + d.target.y) / 2 - 6)
                .attr("width", 40)
                .attr("height", 12);
        });

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    };

    const getColor = (type) => {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">
                {error}
            </div>
        );
    }

    const totalRelationships = relationships.outgoing.length + relationships.incoming.length;

    return (
        <div className="h-full flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm">
                <div>
                    <h3 className="font-bold text-slate-800">Connection Graph</h3>
                    <p className="text-xs text-slate-500">Drag nodes to explore</p>
                </div>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium border border-slate-200">
                    {totalRelationships} Connections
                </span>
            </div>

            <div className="flex-1 relative bg-slate-50">
                {totalRelationships === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-16 h-16 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-sm font-medium">No connections yet</p>
                        <p className="text-xs mt-1 text-slate-400">Add a relationship to see the network</p>
                    </div>
                ) : (
                    <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '300px', cursor: 'grab' }}></svg>
                )}
            </div>
        </div>
    );
}
