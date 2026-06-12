import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiSunLine, RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine, RiUserLine } from 'react-icons/ri';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]   = useState({ name:'', email:'', password:'' });
  const [show,    setShow]   = useState(false);
  const [error,   setError]  = useState('');
  const [loading, setLoading]= useState(false);

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); setError(''); };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  })();
  const strengthLabel = ['','Weak','Fair','Good','Strong'][strength];
  const strengthColor = ['','#EF4444','#F59E0B','#3B82F6','#16A34A'][strength];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-blob blob-1"/>
      <div className="auth-blob blob-2"/>

      <div className="auth-card scale-in" style={{ maxWidth:430 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon"><RiSunLine size={24}/></div>
          <h1 className="auth-logo-name">TaskWarm</h1>
          <p className="auth-logo-tag">Create your account — it's free ✦</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrap">
              <RiUserLine className="input-icon" size={16}/>
              <input
                className="form-input with-icon"
                type="text" placeholder="Snehanjali"
                value={form.name} onChange={e=>set('name',e.target.value)}
                autoComplete="name" autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <RiMailLine className="input-icon" size={16}/>
              <input
                className="form-input with-icon"
                type="email" placeholder="you@example.com"
                value={form.email} onChange={e=>set('email',e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <RiLockLine className="input-icon" size={16}/>
              <input
                className="form-input with-icon"
                type={show?'text':'password'} placeholder="Min. 6 characters"
                value={form.password} onChange={e=>set('password',e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="input-eye" onClick={()=>setShow(s=>!s)} tabIndex={-1}>
                {show ? <RiEyeOffLine size={16}/> : <RiEyeLine size={16}/>}
              </button>
            </div>
            {form.password && (
              <div className="strength-wrap">
                <div className="strength-bars">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="strength-bar"
                      style={{ background: i <= strength ? strengthColor : 'var(--border2)' }}/>
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-full btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}}/> Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}