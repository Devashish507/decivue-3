import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { decisionService } from '../../services/api';

const COLUMNS = [
    { id: 'decisions', title: 'DECISIONS', cardColor: '#A78BFA' },
    { id: 'todo', title: 'TO-DO', cardColor: '#F4A261' },
    { id: 'progress', title: 'IN PROGRESS', cardColor: '#81D4E8' },
    { id: 'completed', title: 'COMPLETED', cardColor: '#E9D66B' },
];

export default function DecisionKanban({ decisions, onUpdate }) {
    const [items, setItems] = useState({
        decisions: [],
        todo: [],
        progress: [],
        completed: []
    });
    const [activeId, setActiveId] = useState(null);
    const [activeColumn, setActiveColumn] = useState(null);

    // Initialize items from decisions prop
    useEffect(() => {
        if (decisions) {
            const newItems = {
                decisions: decisions.filter(d =>
                    d.kanban_status === 'decisions' ||
                    (!d.kanban_status && !['todo', 'progress', 'completed'].includes(d.kanban_status))
                ),
                todo: decisions.filter(d => d.kanban_status === 'todo'),
                progress: decisions.filter(d => d.kanban_status === 'progress'),
                completed: decisions.filter(d => d.kanban_status === 'completed'),
            };

            // If no decisions have kanban_status set, put all in the DECISIONS column
            const hasAnyKanbanStatus = decisions.some(d => d.kanban_status);
            if (!hasAnyKanbanStatus) {
                newItems.decisions = [...decisions];
                newItems.todo = [];
                newItems.progress = [];
                newItems.completed = [];
            }

            setItems(newItems);
        }
    }, [decisions]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const findContainer = (id) => {
        if (id in items) return id;
        return Object.keys(items).find((key) => items[key].find((item) => item.id === id));
    };

    const handleDragStart = (event) => {
        const container = findContainer(event.active.id);
        setActiveId(event.active.id);
        setActiveColumn(container);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id) || over.id;

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over?.id) || over?.id;

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            setActiveId(null);
            setActiveColumn(null);
            return;
        }

        const activeItem = items[activeContainer].find(i => i.id === active.id);

        setItems((prev) => {
            const newItems = {
                ...prev,
                [activeContainer]: prev[activeContainer].filter((item) => item.id !== active.id),
                [overContainer]: [...prev[overContainer], activeItem],
            };
            return newItems;
        });

        setActiveId(null);
        setActiveColumn(null);

        // API Update
        await updateDecisionStatus(activeItem, overContainer);
    };

    const updateDecisionStatus = async (decision, formattedStatus) => {
        try {
            const updates = { kanban_status: formattedStatus };

            if (formattedStatus === 'decisions') {
                updates.lifecycleState = 'Draft';
            } else if (formattedStatus === 'todo') {
                updates.lifecycleState = 'Draft';
            } else if (formattedStatus === 'progress') {
                updates.lifecycleState = 'Active';
            } else if (formattedStatus === 'completed') {
                updates.lifecycleState = 'Closed';
                updates.progressPercentage = 100;
            }

            await decisionService.update(decision.id, updates);
        } catch (error) {
            console.error('Failed to update decision status:', error);
        }
    };

    const activeDecision = activeId ? (
        Object.values(items).flat().find(i => i.id === activeId)
    ) : null;

    const activeColumnData = activeColumn ? COLUMNS.find(c => c.id === activeColumn) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full w-full gap-5 p-5 bg-gray-100 overflow-x-auto">
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        count={items[col.id]?.length || 0}
                        items={items[col.id] || []}
                        cardColor={col.cardColor}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeDecision ? (
                    <KanbanCard
                        decision={activeDecision}
                        cardColor={activeColumnData?.cardColor || '#F4A261'}
                        isDragOverlay={true}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
