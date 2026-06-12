import React, { useState } from 'react';
import { format, isPast, parseISO } from 'date-fns';
import { RiMoreLine, RiPencilLine, RiDeleteBinLine, RiCheckLine, RiArrowGoBackLine } from 'react-icons/ri';
import { useTasks } from '../context/TaskContext';
import TaskModal from './TaskModal';
import './TaskCard.css';

const PRIORITY_MAP = {
  high: { label:'High',  cls:'badge-high',  dot:'#EF4444' },
  med:  { label:'Med',   cls:'badge-med',   dot:'#F59E0B' },
  low:  { label:'Low',   cls:'badge-low',   dot:'#16A34A' },
};
const STATUS_MAP = {
  todo:       { label:'To Do',      cls:'badge-todo'       },
  inprogress: { label:'In Progress',cls:'badge-inprogress' },
  done:       { label:'Done',       cls:'badge-done'       },
};

export default function TaskCard({ task, compact = false }) {
  const { editTask, removeTask } = useTasks();
  const [showMenu,  setShowMenu]  = useState(false);
  const [showEdit,  setShowEdit]  = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const prio   = PRIORITY_MAP[task.priority] || PRIORITY_MAP.med;
  const status = STATUS_MAP[task.status]     || STATUS_MAP.todo;
  const isOverdue = task.due && task.status !== 'done' && isPast(parseISO(task.due));

  async function toggleDone() {
    await editTask(task._id, { status: task.status === 'done' ? 'todo' : 'done' });
  }
  async function handleDelete() {
    setDeleting(true);
    await removeTask(task._id);
  }

  return (
    <>
      <div className={`task-card${task.status==='done'?' done':''}${compact?' compact':''}`}
        style={{ '--prio-color': prio.dot }}>
        <div className="task-card-bar"/>

        <div className="task-card-header">
          {/* Done toggle */}
          <button
            className={`task-check${task.status==='done'?' checked':''}`}
            onClick={toggleDone} title={task.status==='done'?'Mark undone':'Mark done'}
          >
            {task.status==='done' ? <RiCheckLine size={13}/> : null}
          </button>

          <p className={`task-title${task.status==='done'?' done-title':''}`}>{task.title}</p>

          {/* Menu */}
          <div className="task-menu-wrap">
            <button className="task-menu-btn" onClick={()=>setShowMenu(s=>!s)} aria-label="Options">
              <RiMoreLine size={17}/>
            </button>
            {showMenu && (
              <div className="task-dropdown" onMouseLeave={()=>setShowMenu(false)}>
                <button onClick={()=>{setShowMenu(false);setShowEdit(true);}}>
                  <RiPencilLine size={14}/> Edit
                </button>
                <button onClick={()=>{setShowMenu(false);toggleDone();}}>
                  {task.status==='done'
                    ? <><RiArrowGoBackLine size={14}/> Mark Undone</>
                    : <><RiCheckLine size={14}/> Mark Done</>}
                </button>
                <button className="danger" onClick={()=>{setShowMenu(false);handleDelete();}} disabled={deleting}>
                  <RiDeleteBinLine size={14}/> {deleting?'Deleting…':'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {!compact && task.desc && (
          <p className="task-desc">{task.desc}</p>
        )}

        <div className="task-card-footer">
          <span className={`badge ${status.cls}`}>{status.label}</span>
          <span className={`badge ${prio.cls}`}>{prio.label}</span>
          {task.category && <span className="chip">{task.category}</span>}
          {task.due && (
            <span className={`task-due${isOverdue?' overdue':''}`}>
              📅 {format(parseISO(task.due), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      {showEdit && <TaskModal task={task} onClose={()=>setShowEdit(false)}/>}
    </>
  );
}