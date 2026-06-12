import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiAddLine, RiSaveLine } from 'react-icons/ri';
import { useTasks } from '../context/TaskContext';
import './TaskModal.css';

export default function TaskModal({ task, isPreset = false, onClose }) {
  const { addTask, editTask } = useTasks();
  const isEditing = !!task && !isPreset;

  const [form, setForm] = useState({
    title:    isEditing ? task.title       : '',
    desc:     isEditing ? (task.desc||'')  : '',
    status:   task?.status   || 'todo',
    priority: isEditing ? task.priority    : 'med',
    category: isEditing ? (task.category||'') : '',
    due:      isEditing && task.due ? task.due.slice(0,10) : '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); if(errors[k]) setErrors(p=>({...p,[k]:''})); };

  async function handleSubmit() {
    if (!form.title.trim()) { setErrors({title:'Title is required'}); return; }
    setSaving(true);
    try {
      const payload = { ...form, due: form.due || undefined };
      if (isEditing) await editTask(task._id, payload);
      else           await addTask(payload);
      onClose();
    } catch {} finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal scale-in" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Edit Task' : '✦ New Task'}</h2>
          <button className="modal-close" onClick={onClose}><RiCloseLine size={20}/></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input className={`form-input${errors.title?' input-error':''}`}
              value={form.title} onChange={e=>set('title',e.target.value)}
              placeholder="What needs to be done?" autoFocus/>
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.desc}
              onChange={e=>set('desc',e.target.value)}
              placeholder="Add details, notes, or context…"/>
          </div>
          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>set('status',e.target.value)}>
                <option value="todo">📋 To Do</option>
                <option value="inprogress">⚡ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                <option value="high">🔴 High</option>
                <option value="med">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div className="modal-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category}
                onChange={e=>set('category',e.target.value)}
                placeholder="e.g. Frontend…" list="cat-list"/>
              <datalist id="cat-list">
                {['Frontend','Backend','Design','DevOps','Docs','Testing','Research'].map(c=>
                  <option key={c} value={c}/>)}
              </datalist>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.due}
                onChange={e=>set('due',e.target.value)}/>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Saving…</>
              : isEditing ? <><RiSaveLine size={16}/> Save Changes</> : <><RiAddLine size={16}/> Create Task</>}
          </button>
        </div>
      </div>
    </div>
  );
}