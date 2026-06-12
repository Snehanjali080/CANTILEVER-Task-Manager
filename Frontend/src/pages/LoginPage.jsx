import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiSunLine, RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine } from 'react-icons/ri';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,   setForm]   = useState({ email:'', password:'' });
  const [show,   setShow]   = useState(false);
  const [error,  setError]  = useState('');
  const [loading,setLoading]= useState(false);

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); setError(''); };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      {/* Decorative blobs */}
      <div className="auth-blob blob-1"/>
      <div className="auth-blob blob-2"/>

      <div className="auth-card scale-in">
        <div className="auth-logo">
          <div className="auth-logo-icon"><RiSunLine size={24}/></div>
          <h1 className="auth-logo-name">TaskWarm</h1>
          <p className="auth-logo-tag">Welcome back — let's get things done ✦</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
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
                type={show?'text':'password'} placeholder="••••••••"
                value={form.password} onChange={e=>set('password',e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="input-eye" onClick={()=>setShow(s=>!s)} tabIndex={-1}>
                {show ? <RiEyeOffLine size={16}/> : <RiEyeLine size={16}/>}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}}/> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>

        <div className="auth-demo">
          <span>Demo credentials</span>
          <code>any email / any password (register first)</code>
        </div>
      </div>
    </div>
  );
}