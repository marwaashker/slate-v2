import Column from './column';

function Board({ columns, onAdd, onToggle, onDelete, todayTasks,onAddSubtasks ,onPriority }) {
    return (
        <div className="board-scroll-wrap">
            <div className="board">

                {columns.map(col => (
                    <Column
                        key={col.id}
                        column={col}
                        onAdd={onAdd}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        columns={columns}
                        onAddSubtasks={onAddSubtasks}
                        onPriority={onPriority}
                    />
                ))}
            </div>
        </div>
    )
}

export default Board