import React, { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { RiAddLine } from 'react-icons/ri';
import './BoardPage.css';

const COLUMNS = [
  { key:'todo',       label:'To Do',       emoji:'📋', color:'#3B82F6', bg:'#EFF6FF' },
  { key:'inprogress', label:'In Progress', emoji:'⚡', color:'#8B5CF6', bg:'#F5F3FF' },
  { key:'done',       label:'Done',        emoji:'✅', color:'#16A34A', bg:'#F0FDF4' },
];

export default function BoardPage() {
  const { tasks, loading, fetchTasks } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  useEffect(() => { fetchTasks(); }, []); // eslint-disable-line

  function openModalFor(status) {
    setDefaultStatus(status);
    setShowModal(true);
  }

  return (
    <div className="page-wrap fade-in">
      <div className="board-header">
        <div>
          <h1 className="page-title">Board</h1>
          <p className="page-subtitle">Drag tasks across columns to update status</p>
        </div>
        <button className="btn btn-primary" onClick={()=>openModalFor('todo')}>
          <RiAddLine size={17}/> New Task
        </button>
      </div>

      {loading ? (
        <div className="board-grid">
          {COLUMNS.map(c=>(
            <div key={c.key} className="board-col skeleton" style={{height:400}}/>
          ))}
        </div>
      ) : (
        <div className="board-grid">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="board-col">
                {/* Column header */}
                <div className="board-col-header" style={{'--col-color':col.color,'--col-bg':col.bg}}>
                  <span className="board-col-emoji">{col.emoji}</span>
                  <span className="board-col-title">{col.label}</span>
                  <span className="board-col-count"
                    style={{background:col.bg, color:col.color}}>
                    {colTasks.length}
                  </span>
                  <button
                    className="board-add-btn"
                    onClick={()=>openModalFor(col.key)}
                    title={`Add to ${col.label}`}
                  >
                    <RiAddLine size={15}/>
                  </button>
                </div>

                {/* Cards */}
                <div className="board-col-body">
                  {colTasks.length === 0 ? (
                    <div className="board-empty">
                      <p>No tasks here</p>
                      <button className="btn btn-ghost btn-sm"
                        onClick={()=>openModalFor(col.key)}>
                        <RiAddLine size={13}/> Add one
                      </button>
                    </div>
                  ) : (
                    colTasks.map(t => (
                      <TaskCard key={t._id} task={t} compact/>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={{ status: defaultStatus }}
          isPreset
          onClose={()=>setShowModal(false)}
        />
      )}
    </div>
  );
}