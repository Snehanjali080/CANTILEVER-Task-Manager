import React, { useEffect, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         isSameMonth, isSameDay, isToday, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import './CalendarPage.css';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const { tasks, fetchTasks } = useTasks();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  useEffect(() => { fetchTasks(); }, []); // eslint-disable-line

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const gridStart  = startOfWeek(monthStart);
  const gridEnd    = endOfWeek(monthEnd);
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const tasksByDate = tasks.reduce((acc, t) => {
    if (!t.due) return acc;
    const key = t.due.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const selectedKey   = format(selected, 'yyyy-MM-dd');
  const selectedTasks = tasksByDate[selectedKey] || [];

  return (
    <div className="page-wrap fade-in">
      <div className="cal-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Tasks with due dates shown on calendar</p>
        </div>
      </div>

      <div className="cal-layout">
        {/* Calendar grid */}
        <div className="card cal-card">
          {/* Month nav */}
          <div className="cal-nav">
            <button className="btn btn-ghost btn-sm" onClick={()=>setCurrent(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}>
              <RiArrowLeftLine size={16}/>
            </button>
            <h2 className="cal-month">{format(current,'MMMM yyyy')}</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>setCurrent(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}>
              <RiArrowRightLine size={16}/>
            </button>
          </div>

          {/* Day names */}
          <div className="cal-grid-head">
            {DAYS.map(d=><div key={d} className="cal-day-name">{d}</div>)}
          </div>

          {/* Days */}
          <div className="cal-grid">
            {days.map(day => {
              const key   = format(day,'yyyy-MM-dd');
              const dayTasks = tasksByDate[key] || [];
              const outside  = !isSameMonth(day, current);
              const today    = isToday(day);
              const selDay   = isSameDay(day, selected);
              return (
                <div key={key}
                  className={`cal-day${outside?' outside':''}${today?' today':''}${selDay?' selected':''}`}
                  onClick={()=>setSelected(day)}
                >
                  <span className="cal-day-num">{format(day,'d')}</span>
                  <div className="cal-dots">
                    {dayTasks.slice(0,3).map(t=>(
                      <div key={t._id} className={`cal-dot dot-${t.priority}`}
                        title={t.title}/>
                    ))}
                    {dayTasks.length > 3 && <span className="cal-more">+{dayTasks.length-3}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="card cal-side">
          <h3 className="cal-side-title">
            {isToday(selected) ? '📅 Today' : format(selected,'EEE, MMM d')}
          </h3>
          {selectedTasks.length === 0 ? (
            <div className="cal-no-tasks">
              <p>No tasks due on this day.</p>
            </div>
          ) : (
            <ul className="cal-task-list">
              {selectedTasks.map(t=>(
                <li key={t._id} className="cal-task-item">
                  <div className={`cal-task-dot dot-${t.priority}`}/>
                  <div>
                    <p className={`cal-task-title${t.status==='done'?' done':''}`}>{t.title}</p>
                    <span className={`badge badge-${t.status}`} style={{fontSize:'.68rem'}}>
                      {t.status==='inprogress'?'In Progress':t.status==='done'?'Done':'To Do'}
                    </span>
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