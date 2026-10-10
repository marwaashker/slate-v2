import { useState } from 'react';
import TaskInput from './taskInput'
import TaskList from './taskList'


function Column({ column, onAdd, onToggle, onDelete, columns, onAddSubtasks, onPriority }) {
    const doneCount = column.tasks.filter(t => t.done).length;
    const PRIORITY_LIST = [{ value: 'all', label: 'All' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]
    const [selectedPriority, setSelectedPriority] = useState('all');
    const filteredTasks = selectedPriority === 'all' ? column.tasks : column.tasks.filter(task => task.priority === selectedPriority);

    return (
        <div className={`column col-sm-12 ${column.isWeekend ? 'column-weekend' : ''}`}>
            <div className="col-header">
                <div>
                    <h2 className="col-label">{column.label}</h2>
                    <span className="col-date">{column.date}</span>
                </div>

                <div>
                    {column.tasks.length > 0 && (
                        <span className="col-count">{doneCount}/{column.tasks.length}</span>
                    )}
                    <select id="priority-dropdown" onChange={(e) => setSelectedPriority(e.target.value)} className='priority-filter'>
                        {PRIORITY_LIST.map((p) =>
                            <option value={p.value} key={p.value} >{p.label}</option>)}

                    </select>
                </div>

            </div>

            <TaskInput colId={column.id} onAdd={onAdd} columns={columns} />


            <TaskList
                colId={column.id}
                tasks={column.tasks}
                onToggle={onToggle}
                onDelete={onDelete}
                columns={columns}
                onAddSubtasks={onAddSubtasks}
                onPriority={onPriority}
                filteredTasks={filteredTasks}
            />



        </div>
    )
}

export default Column
