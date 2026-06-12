import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { format, isPast, parseISO } from 'date-fns';
import {
  RiAddLine, RiArrowRightLine, RiFireLine,
  RiCheckboxCircleLine, RiTimeLine, RiAlertLine
} from 'react-icons/ri';
import './Dashboard.css';

/* ── Animated donut ring ─────────────────────────────────────── */
function ProgressRing({ done, total }) {
  const pct   = total > 0 ? done / total : 0;
  const r     = 52;
  const circ  = 2 * Math.PI * r;
  const dash  = pct * circ;

  return (
    <div className="progress-ring-wrap">
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* track */}
        <circle cx="64" cy="64" r={r} fill="none"
          stroke="var(--border2)" strokeWidth="9"/>
        {/* fill */}
        <circle cx="64" cy="64" r={r} fill="none"
          stroke="var(--orange)" strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}   /* start from top */
          style={{ transition:'stroke-dasharray .8s cubic-bezier(.4,0,.2,1)', filter:'drop-shadow(0 0 6px rgba(249,115,22,.5))' }}
        />
      </svg>
      <div className="progress-ring-label">
        <span className="ring-pct">{Math.round(pct * 100)}%</span>
        <span className="ring-sub">done</span>
      </div>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card" style={{ '--c': color, '--cb': bg }}>
      <div className="stat-icon"><Icon size={20}/></div>
      <div className="stat-num">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user }  = useAuth();
  const { tasks, stats, fetchTasks, fetchStats, loading } = useTasks();

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []); // eslint-disable-line

  const total    = stats?.total      ?? tasks.length;
  const done     = stats?.byStatus?.done       ?? tasks.filter(t=>t.status==='done').length;
  const inprog   = stats?.byStatus?.inprogress ?? tasks.filter(t=>t.status==='inprogress').length;
  const overdue  = stats?.overdue              ?? tasks.filter(t=>t.due && t.status!=='done' && isPast(parseISO(t.due))).length;

  const recent   = [...tasks].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-wrap fade-in">

      {/* ── Hero greeting ── */}
      <div className="dash-hero">
        <div className="dash-greeting">
          <p className="greeting-eyebrow">{greeting} ✦</p>
          <h1 className="page-title">{user?.name?.split(' ')[0] || 'there'}, here's your day</h1>
          <p className="page-subtitle">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Link to="/tasks" className="btn btn-primary">
          <RiAddLine size={17}/> New Task
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="stats-grid">
        <StatCard icon={RiFireLine}            label="Total Tasks"  value={total}  color="#F97316" bg="#FFF0E6"/>
        <StatCard icon={RiTimeLine}            label="In Progress"  value={inprog} color="#8B5CF6" bg="#F5F3FF"/>
        <StatCard icon={RiCheckboxCircleLine}  label="Completed"    value={done}   color="#16A34A" bg="#F0FDF4"/>
        <StatCard icon={RiAlertLine}           label="Overdue"      value={overdue} color="#DC2626" bg="#FEF2F2"/>
      </div>

      {/* ── Progress + Recent ── */}
      <div className="dash-body">

        {/* Progress card */}
        <div className="card dash-progress-card">
          <h3 className="card-title">Today's Progress</h3>
          <ProgressRing done={done} total={total}/>
          <div className="progress-meta">
            <span><strong>{done}</strong> completed</span>
            <span style={{color:'var(--text4)'}}>of</span>
            <span><strong>{total}</strong> total</span>
          </div>
          {total > 0 && (
            <div className="progress-bar-wrap">
              <div className="progress-bar-track">
                <div className="progress-bar-fill"
                  style={{ width:`${Math.round((done/total)*100)}%` }}/>
              </div>
            </div>
          )}
          <Link to="/board" className="btn btn-secondary btn-full" style={{marginTop:'1.2rem'}}>
            View Board <RiArrowRightLine size={15}/>
          </Link>
        </div>

        {/* Recent tasks */}
        <div className="card dash-recent-card">
          <div className="card-header">
            <h3 className="card-title">Recent Tasks</h3>
            <Link to="/tasks" className="card-link">See all <RiArrowRightLine size={14}/></Link>
          </div>

          {loading ? (
            <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:12}}>
              {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:62}}/>)}
            </div>
          ) : recent.length === 0 ? (
            <div className="empty-state" style={{padding:'2rem 0'}}>
              <div style={{fontSize:'2.5rem',marginBottom:8}}>🌱</div>
              <h3>No tasks yet</h3>
              <p>Create your first task to get started.</p>
            </div>
          ) : (
            <ul className="recent-list">
              {recent.map(t => (
                <li key={t._id} className="recent-item">
                  <div className={`recent-dot priority-dot-${t.priority}`}/>
                  <div className="recent-info">
                    <p className={`recent-title${t.status==='done'?' line-through':''}`}>{t.title}</p>
                    <div className="recent-meta">
                      <span className={`badge badge-${t.status}`}>
                        {t.status==='inprogress'?'In Progress':t.status==='done'?'Done':'To Do'}
                      </span>
                      {t.due && (
                        <span className={`recent-due${t.status!=='done'&&isPast(parseISO(t.due))?' overdue':''}`}>
                          {format(parseISO(t.due),'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}