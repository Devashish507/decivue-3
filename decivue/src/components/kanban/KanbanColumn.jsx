import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';

export default function KanbanColumn({ id, title, count, items, cardColor }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    // Column header text color matches reference: bold, uppercase
    const headerColors = {
        decisions: 'text-purple-600',
        todo: 'text-gray-800',
        progress: 'text-gray-800',
        completed: 'text-emerald-600',
    };

    return (
        <div className="flex flex-col h-full flex-1 min-w-[260px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${headerColors[id] || 'text-gray-800'}`}>
                    {title}
                </h3>
            </div>


            {/* Column Body (Droppable Area) */}
            <div
                ref={setNodeRef}
                className={`flex-1 space-y-3 overflow-y-auto pr-1 transition-colors rounded-lg p-1 ${isOver ? 'bg-gray-200/60' : ''}`}
                style={{ minHeight: '100px' }}
            >
                <SortableContext items={items.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    {items.map((decision) => (
                        <KanbanCard key={decision.id} decision={decision} cardColor={cardColor} />
                    ))}
                    {items.length === 0 && (
                        <div className="h-24 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <span className="text-xs font-medium">Drop here</span>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
