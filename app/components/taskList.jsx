import TaskItem from "./taskItem";
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export default function TaskList({ onDelete, tasks, onToggle, colId, onPriority, onAddSubtasks }) {
    const { setNodeRef, isOver } = useDroppable({ id: colId });


    return (
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                style={{
                    background: isOver ? '#fcfbfd' : 'transparent',
                    minHeight: tasks.length ? 'auto' : '56px',
                    borderRadius: '8px',
                }}
            >

                {tasks.length ? tasks.map((item) =>
                    <ul key={item.id}>
                        <TaskItem item={item} onDelete={onDelete} onToggle={onToggle} onAddSubtasks={onAddSubtasks} onPriority={onPriority} />
                    </ul>
                ) : <div className="empty-state"><p className="empty-state">Drop task here</p></div>}
            </div>
        </SortableContext>

    )
}
