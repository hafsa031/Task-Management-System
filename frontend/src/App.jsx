import { useState, useEffect } from 'react'
import api from './api'
import './index.css'
import Card from './components/common/Card'
import Input from './components/common/Input'
import Button from './components/common/Button'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [view, setView] = useState('login')
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  // ---------------- AUTH STATE ----------------

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ---------------- TASK STATE ----------------

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [editingId, setEditingId] = useState(null)

  // ---------------- FETCH TASKS ----------------

  useEffect(() => {
    if (token) {
      fetchTasks()
    }
  }, [token])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } catch (err) {
      setError('Failed to load tasks')
    }
  }

  // ---------------- REGISTER ----------------

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await api.post('/auth/register', {
        username,
        email,
        password,
      })

      setView('login')
      setPassword('')
      setSuccess('Account created successfully! Please sign in.')
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Registration failed'
      )
    }
  }

  // ---------------- LOGIN ----------------

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)

      const res = await api.post('/auth/login', form, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      localStorage.setItem('token', res.data.access_token)
      setToken(res.data.access_token)

      setUsername('')
      setPassword('')
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Login failed'
      )
    }
  }

  // ---------------- LOGOUT ----------------

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    setTasks([])
    setUsername('')
    setPassword('')
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setEstimatedTime('')
    setEditingId(null)
  }

  // ---------------- AI SUGGESTION ----------------

  const handleAISuggestion = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first.')
      return
    }

    try {
      setError('')
      setSuccess('')
      setLoadingAI(true)

      const res = await api.post('/ai/suggest-description', {
        title,
      })

      setDescription(res.data.description || '')
      setPriority(res.data.priority || 'Medium')
      setEstimatedTime(res.data.estimated_time || '')
      setSuccess('✨ AI generated task details successfully!')
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to generate AI suggestion'
      )
    } finally {
      setLoadingAI(false)
    }
  }

  // ---------------- CREATE / UPDATE TASK ----------------

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, {
          title,
          description,
          priority,
          estimated_time: estimatedTime,
        })
        setSuccess('Task updated successfully!')
        setEditingId(null)
      } else {
        await api.post('/tasks', {
          title,
          description,
          priority,
          estimated_time: estimatedTime,
        })
        setSuccess('Task added successfully!')
      }

      setTitle('')
      setDescription('')
      setPriority('Medium')
      setEstimatedTime('')
      await fetchTasks()
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to save task'
      )
    }
  }

  // ---------------- EDIT ----------------

  const handleEdit = (task) => {
    setEditingId(task.id)
    setTitle(task.title)
    setDescription(task.description || '')
    setPriority(task.priority || 'Medium')
    setEstimatedTime(task.estimated_time || '')
    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ---------------- DELETE ----------------

  const handleDelete = async (id) => {
    try {
      setError('')
      setSuccess('')
      await api.delete(`/tasks/${id}`)
      setSuccess('Task deleted successfully!')
      await fetchTasks()
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to delete task'
      )
    }
  }

  // ---------------- COMPLETE ----------------

  const toggleComplete = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        completed: !task.completed,
      })
      await fetchTasks()
    } catch (err) {
      setError('Failed to update task')
    }
  }

  // ---------------- CANCEL EDIT ----------------

  const cancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setEstimatedTime('')
    setError('')
    setSuccess('')
  }

  // ============================================================
  // LOGIN / REGISTER
  // ============================================================

  if (!token) {
    return (
      <div className="auth-page">
        <Card className="auth-card">
          <div className="brand">
            <div className="brand-icon">🚀</div>
            <h1>TaskFlow</h1>
            <p>Organize your work. Get things done.</p>
          </div>

          {error && (
            <div className="message error">⚠️ {error}</div>
          )}

          {success && (
            <div className="message success">✅ {success}</div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="form">
              <h2>Welcome Back 👋</h2>
              <p className="form-subtitle">
                Sign in to continue to your workspace
              </p>

              <Input
                label="Username"
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary-button" style={{ marginTop: '8px' }}>
                Sign In →
              </Button>

              <p className="switch-text">
                Don't have an account?{' '}
                <span
                  className="link"
                  onClick={() => {
                    setView('register')
                    setError('')
                    setSuccess('')
                  }}
                >
                  Create account
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="form">
              <h2>Create Account ✨</h2>
              <p className="form-subtitle">
                Start managing your tasks today
              </p>

              <Input
                label="Username"
                id="reg-username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                label="Email"
                id="reg-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                id="reg-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary-button" style={{ marginTop: '8px' }}>
                Create Account →
              </Button>

              <p className="switch-text">
                Already have an account?{' '}
                <span
                  className="link"
                  onClick={() => {
                    setView('login')
                    setError('')
                    setSuccess('')
                  }}
                >
                  Sign in
                </span>
              </p>
            </form>
          )}
        </Card>
      </div>
    )
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <div className="dashboard-brand">🚀 TaskFlow</div>
          <p>Your personal productivity workspace</p>
        </div>

        <Button variant="logout-button" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <main className="dashboard-content">
        {/* WELCOME */}
        <section className="welcome-section">
          <div>
            <h1>My Workspace 👋</h1>
            <p>Plan your tasks and let AI help you get started.</p>
          </div>

          <div className="task-counter">
            <strong>{tasks.length}</strong>
            <span>{tasks.length === 1 ? 'Task' : 'Tasks'}</span>
          </div>
        </section>

        {/* MESSAGES */}
        {error && (
          <div className="message error">⚠️ {error}</div>
        )}

        {success && (
          <div className="message success">{success}</div>
        )}

        {/* TASK FORM */}
        <section className="task-creator">
          <div className="section-title">
            <div className="section-icon">
              {editingId ? '✏️' : '➕'}
            </div>
            <div>
              <h2>{editingId ? 'Edit Task' : 'Create a New Task'}</h2>
              <p>
                {editingId
                  ? 'Update your task details below.'
                  : 'Add a task and use AI to create a description, priority, and timeline.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateOrUpdate} className="task-form">
            <Input
              label="Task Title"
              id="task-title"
              className="task-input"
              placeholder="e.g. Learn Docker"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="field">
              <div className="description-header">
                <label htmlFor="task-description">Description</label>
                <span className="ai-label">✨ AI Powered</span>
              </div>

              <textarea
                id="task-description"
                className="description-input"
                placeholder="Write a description or let AI create one for you..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            {/* PRIORITY & ESTIMATED TIME FIELDS */}
            <div className="form-row" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="input-field select-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="task-time">Estimated Time</label>
                <input
                  id="task-time"
                  type="text"
                  className="input-field"
                  placeholder="e.g. 2 hours"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <Button
                type="button"
                variant="ai-button"
                onClick={handleAISuggestion}
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <>
                    <span className="spinner"></span> Generating with AI...
                  </>
                ) : (
                  <>✨ Generate with AI (Description, Priority & Time)</>
                )}
              </Button>
            </div>

            <div className="form-actions" style={{ marginTop: '15px' }}>
              <Button type="submit" variant="primary-button">
                {editingId ? '💾 Update Task' : '➕ Add Task'}
              </Button>

              {editingId && (
                <Button
                  type="button"
                  variant="cancel-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>

        {/* TASK LIST */}
        <section className="tasks-section">
          <div className="tasks-heading">
            <h2>Your Tasks</h2>
            <p>Stay organized and keep moving forward.</p>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No tasks yet</h3>
              <p>Create your first task above and start being productive!</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className={`task-card ${
                    task.completed ? 'task-completed' : ''
                  }`}
                >
                  <div className="task-check">
                    <button
                      onClick={() => toggleComplete(task)}
                      className={
                        task.completed
                          ? 'check-button checked'
                          : 'check-button'
                      }
                    >
                      {task.completed ? '✓' : ''}
                    </button>
                  </div>

                  <div className="task-content">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}

                    {/* METADATA BADGES FOR PRIORITY & ESTIMATED TIME */}
                    <div className="task-meta" style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          background: task.priority === 'High' ? '#fee2e2' : task.priority === 'Low' ? '#e0f2fe' : '#fef9c3', 
                          color: task.priority === 'High' ? '#991b1b' : task.priority === 'Low' ? '#0369a1' : '#854d0e', 
                          fontWeight: 'bold' 
                        }}
                      >
                        📌 {task.priority || 'Medium'} Priority
                      </span>

                      {task.estimated_time && (
                        <span 
                          className="badge time-badge" 
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            background: '#f3f4f6', 
                            color: '#374151' 
                          }}
                        >
                          ⏱️ {task.estimated_time}
                        </span>
                      )}

                      <span className="task-status" style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>
                        {task.completed ? '✓ Completed' : '○ In Progress'}
                      </span>
                    </div>
                  </div>

                  <div className="task-actions">
                    <Button
                      variant="edit-button"
                      onClick={() => handleEdit(task)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="delete-button"
                      onClick={() => handleDelete(task.id)}
                    >
                      🗑 Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>TaskFlow • Built with React + FastAPI + AI</p>
      </footer>
    </div>
  )
}

export default App