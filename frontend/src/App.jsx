import { useState, useEffect } from 'react'
import api from './api'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [view, setView] = useState('login')
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')

  // auth form state
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // task form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (token) fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } catch (err) {
      setError('Failed to load tasks')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/register', { username, email, password })
      setView('login')
      setPassword('')
      setError('Registered successfully! Please log in.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const res = await api.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      localStorage.setItem('token', res.data.access_token)
      setToken(res.data.access_token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    setTasks([])
    setUsername('')
    setPassword('')
  }

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, { title, description })
        setEditingId(null)
      } else {
        await api.post('/tasks', { title, description })
      }
      setTitle('')
      setDescription('')
      fetchTasks()
    } catch (err) {
      setError('Failed to save task')
    }
  }

  const handleEdit = (task) => {
    setEditingId(task.id)
    setTitle(task.title)
    setDescription(task.description || '')
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      fetchTasks()
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const toggleComplete = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { completed: !task.completed })
      fetchTasks()
    } catch (err) {
      setError('Failed to update task')
    }
  }

  // ---------- AI SUGGESTION HANDLER ----------
  const handleAISuggestion = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first for AI suggestion.');
      return;
    }
    try {
      setError('');
      const res = await api.post('/ai/suggest-description', { title });
      setDescription(res.data.description);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate AI suggestion');
    }
  };

  // ---------- LOGIN / REGISTER VIEW ----------
  if (!token) {
    return (
      <div className="container">
        <h1>✨ TaskFlow</h1>
        {error && (
          <div className="error">
            <span>⚠️</span> {error}
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="form">
            <h2>Welcome Back</h2>
            <input 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
            <input 
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">Sign In</button>
            <p style={{ textAlign: 'center', marginTop: '10px', color: '#64748b' }}>
              Don't have an account?{' '}
              <span className="link" onClick={() => { setView('register'); setError('') }}>
                Create account
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="form">
            <h2>Create Account</h2>
            <input 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
            <input 
              placeholder="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">Get Started</button>
            <p style={{ textAlign: 'center', marginTop: '10px', color: '#64748b' }}>
              Already registered?{' '}
              <span className="link" onClick={() => { setView('login'); setError('') }}>
                Sign in
              </span>
            </p>
          </form>
        )}
      </div>
    )
  }

  // ---------- TASK DASHBOARD VIEW ----------
  return (
    <div className="container">
      <div className="header">
        <h1>🚀 My Workspace</h1>
        <button className="secondary" onClick={handleLogout}>Logout</button>
      </div>

      {error && (
        <div className="error">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleCreateOrUpdate} className="form task-form">
        <input 
          placeholder="What needs to be done?" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <input 
            placeholder="Add a short description or use AI" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ flex: 1 }}
          />
          <button type="button" className="secondary" onClick={handleAISuggestion}>
            ✨ AI Suggest
          </button>
        </div>
        <button type="submit" style={{ width: '100%' }}>
          {editingId ? '💾 Update Task' : '➕ Add Task'}
        </button>
        {editingId && (
          <button 
            type="button" 
            className="secondary" 
            style={{ width: '100%' }}
            onClick={() => { setEditingId(null); setTitle(''); setDescription('') }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <ul className="task-list">
        {tasks.length === 0 && <p className="empty">No tasks yet. Enjoy your free time or add one above! 🎉</p>}
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <div className="task-info" onClick={() => toggleComplete(task)}>
              <strong>{task.title}</strong>
              {task.description && <p>{task.description}</p>}
            </div>
            <div className="actions">
              <button className="secondary" onClick={() => handleEdit(task)}>Edit</button>
              <button className="danger" onClick={() => handleDelete(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App