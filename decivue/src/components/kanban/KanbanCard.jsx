import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function KanbanCard({ decision, cardColor = '#F4A261', isDragOverlay = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: decision.id, data: { decision } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: cardColor,
    };

    const overlayStyle = {
        backgroundColor: cardColor,
        boxShadow: '0 15px 30px rgba(0,0,0,0.25)',
        transform: 'rotate(3deg) scale(1.05)',
    };

    return (
        <div
            ref={setNodeRef}
            style={isDragOverlay ? overlayStyle : style}
            {...attributes}
            {...listeners}
            className={`relative group rounded-xl px-4 py-3.5 cursor-grab active:cursor-grabbing transition-all ${isDragOverlay ? 'shadow-2xl' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <Link
                    to={`/decisions/${decision.id}`}
                    className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:underline flex-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {decision.statement || decision.title || 'Untitled Decision'}
                </Link>

                <button
                    className="flex-shrink-0 opacity-0 group-hover:opacity-70 hover:!opacity-100 text-gray-700 hover:text-red-700 transition-all p-1 rounded"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Future: handle delete
                    }}
                    title="Remove"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
