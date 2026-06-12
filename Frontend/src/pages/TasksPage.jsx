import React, { useEffect, useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { RiAddLine, RiSearchLine, RiFilter3Line, RiSortAsc } from 'react-icons/ri';
import './TasksPage.css';

const STATUSES  = ['all','todo','inprogress','done'];
const PRIORITIES= ['all','high','med','low'];
const SORTS     = [
  { value:'createdAt-desc', label:'Newest first' },
  { value:'createdAt-asc',  label:'Oldest first' },
  { value:'due-asc',        label:'Due date ↑'   },
  { value:'priority-asc',   label:'Priority'     },
  { value:'title-asc',      label:'Title A–Z'    },
];

export default function TasksPage() {
  const { tasks, loading, fetchTasks } = useTasks();
  const [showModal,  setShowModal]  = useState(false);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('all');
  const [priority,   setPriority]   = useState('all');
  const [sort,       setSort]       = useState('createdAt-desc');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { fetchTasks(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    let t = [...tasks];
    if (status   !== 'all') t = t.filter(x => x.status   === status);
    if (priority !== 'all') t = t.filter(x => x.priority === priority);
    if (search.trim()) {
      const q = search.toLowerCase();
      t = t.filter(x => x.title.toLowerCase().includes(q) || (x.desc||'').toLowerCase().includes(q));
    }
    const [field, dir] = sort.split('-');
    const mult = dir === 'asc' ? 1 : -1;
    t.sort((a,b) => {
      if (field === 'priority') {
        const o = { high:0, med:1, low:2 };
        return (o[a.priority] - o[b.priority]) * mult;
      }
      if (field === 'title') return a.title.localeCompare(b.title) * mult;
      if (field === 'due') {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1; if (!b.due) return -1;
        return (new Date(a.due) - new Date(b.due)) * mult;
      }
      return (new Date(b.createdAt) - new Date(a.createdAt)) * mult;
    });
    return t;
  }, [tasks, status, priority, search, sort]);

  return (
    <div className="page-wrap fade-in">

      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1 className="page-title">All Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length!==1?'s':''} found</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>
          <RiAddLine size={17}/> New Task
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="tasks-toolbar">
        <div className="search-wrap">
          <RiSearchLine className="search-icon" size={16}/>
          <input
            className="search-input"
            placeholder="Search tasks…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
        <button
          className={`btn btn-ghost btn-sm filter-toggle${showFilter?' active':''}`}
          onClick={()=>setShowFilter(f=>!f)}
        >
          <RiFilter3Line size={15}/> Filter
        </button>
        <div className="sort-wrap">
          <RiSortAsc size={15} style={{color:'var(--text3)',flexShrink:0}}/>
          <select className="sort-select" value={sort} onChange={e=>setSort(e.target.value)}>
            {SORTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filter pills */}
      {showFilter && (
        <div className="filter-bar fade-in">
          <div className="filter-group">
            <span className="filter-label">Status</span>
            {STATUSES.map(s=>(
              <button key={s}
                className={`filter-pill${status===s?' active':''}`}
                onClick={()=>setStatus(s)}
              >
                {s==='all'?'All':s==='inprogress'?'In Progress':s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Priority</span>
            {PRIORITIES.map(p=>(
              <button key={p}
                className={`filter-pill${priority===p?' active':''}`}
                onClick={()=>setPriority(p)}
              >
                {p==='all'?'All':p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task grid */}
      {loading ? (
        <div className="tasks-grid">
          {[1,2,3,4,5,6].map(i=>(
            <div key={i} className="skeleton" style={{height:130}}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌿</div>
          <h3>No tasks found</h3>
          <p>{search ? 'Try a different search term.' : 'Create a task to get started!'}</p>
          <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={()=>setShowModal(true)}>
            <RiAddLine size={16}/> Create Task
          </button>
        </div>
      ) : (
        <div className="tasks-grid">
          {filtered.map(t=><TaskCard key={t._id} task={t}/>)}
        </div>
      )}

      {showModal && <TaskModal onClose={()=>setShowModal(false)}/>}
    </div>
  );
}