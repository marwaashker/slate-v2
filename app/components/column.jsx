import TaskInput from './taskInput'
import TaskList from './taskList'


function Column({ column, onAdd, onToggle, onDelete, columns ,onAddSubtasks ,onPriority}) {
    const doneCount = column.tasks.filter(t => t.done).length

    return (
        <div className={`column col-sm-12 ${column.isWeekend ? 'column-weekend' : ''}`}>
            <div className="col-header">
                <div>
                    <h2 className="col-label">{column.label}</h2>
                    <span className="col-date">{column.date}</span>
                </div>
                {column.tasks.length > 0 && (
                    <span className="col-count">{doneCount}/{column.tasks.length}</span>
                )}
            </div>
            <TaskInput colId={column.id} onAdd={onAdd} columns={columns} />
            {/* AI input first, normal input below */}

            <TaskList
                colId={column.id}
                tasks={column.tasks}
                onToggle={onToggle}
                onDelete={onDelete}
                columns={columns}
                onAddSubtasks={onAddSubtasks}
                onPriority={onPriority}
            />



        </div>
    )
}

export default Column
