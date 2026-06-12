import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../utils/api';
import toast from 'react-hot-toast';
import { RiUserLine, RiLockLine, RiSaveLine } from 'react-icons/ri';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name,    setName]    = useState(user?.name || '');
  const [curPwd,  setCurPwd]  = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [saving,  setSaving]  = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (newPwd && newPwd.length < 6) { toast.error('New password must be 6+ characters.'); return; }
    setSaving(true);
    try {
      await updateProfile({
        name,
        ...(newPwd ? { currentPassword: curPwd, newPassword: newPwd } : {}),
      });
      toast.success('Profile updated!');
      setCurPwd(''); setNewPwd('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  }

  function initials(n='') { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

  return (
    <div className="page-wrap fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account details</p>
      </div>

      <div className="settings-layout">
        {/* Avatar card */}
        <div className="card settings-avatar-card">
          <div className="settings-avatar">{initials(user?.name)}</div>
          <p className="settings-name">{user?.name}</p>
          <p className="settings-email">{user?.email}</p>
        </div>

        {/* Form */}
        <div className="card settings-form-card">
          <form onSubmit={handleSave}>

            <div className="settings-section">
              <div className="settings-section-header">
                <RiUserLine size={18}/>
                <h3>Profile</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={e=>setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email || ''} disabled
                  style={{opacity:.6,cursor:'not-allowed'}}/>
                <p className="form-error" style={{color:'var(--text4)'}}>Email cannot be changed</p>
              </div>
            </div>

            <hr className="divider"/>

            <div className="settings-section">
              <div className="settings-section-header">
                <RiLockLine size={18}/>
                <h3>Change Password</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input" type="password"
                  value={curPwd} onChange={e=>setCurPwd(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input" type="password"
                  value={newPwd} onChange={e=>setNewPwd(e.target.value)}
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div className="settings-footer">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving
                  ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Saving…</>
                  : <><RiSaveLine size={16}/> Save Changes</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}