import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RiDashboardLine, RiTaskLine, RiLayoutColumnLine,
  RiCalendarLine, RiSettings3Line, RiLogoutBoxLine,
  RiSunLine, RiMenuLine, RiCloseLine, RiUserLine
} from 'react-icons/ri';
import './Sidebar.css';

const nav = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/tasks',     icon: RiTaskLine,      label: 'All Tasks'  },
  { to: '/board', icon: RiLayoutColumnLine, label: 'Board' },
  { to: '/calendar',  icon: RiCalendarLine,  label: 'Calendar'   },
];

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        {open ? <RiCloseLine size={22}/> : <RiMenuLine size={22}/>}
      </button>

      {/* Backdrop */}
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)}/>}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon"><RiSunLine size={20}/></div>
          <div>
            <h1 className="logo-name">TaskWarm</h1>
            <span className="logo-tagline">Stay warm. Stay focused.</span>
          </div>
        </div>

        <div className="sidebar-divider"/>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Workspace</p>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} className="nav-icon"/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer"/>

        {/* Settings */}
        <div className="sidebar-bottom">
          <NavLink to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <RiSettings3Line size={18} className="nav-icon"/>
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="sidebar-divider"/>

        {/* User */}
        <div className="sidebar-user">
          <div className="user-avatar">{initials(user?.name)}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'User'}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log out">
            <RiLogoutBoxLine size={17}/>
          </button>
        </div>
      </aside>
    </>
  );
}