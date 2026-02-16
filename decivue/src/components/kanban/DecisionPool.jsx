import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

export default function DecisionPool({ decisions }) {
    const { setNodeRef } = useDroppable({
        id: 'pool',
    });

    return (
        <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-10">
                <h3 className="text-lg font-bold text-gray-800">Decision Pool</h3>
                <p className="text-xs text-gray-500 mt-1">{decisions.length} decisions available</p>
            </div>

            <div ref={setNodeRef} className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                <SortableContext items={decisions.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    {decisions.map((decision) => (
                        <KanbanCard key={decision.id} decision={decision} />
                    ))}
                    {decisions.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                            No decisions in pool
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
