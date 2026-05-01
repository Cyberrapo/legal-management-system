import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Add, Close, Edit, Delete, CheckCircle,
  RadioButtonUnchecked, Flag, CalendarToday,
  FilterList, Sort
} from '@mui/icons-material'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Tasks.module.css'

const empty = {
  title: '', description: '', dueDate: '',
  priority: 'Medium', status: 'Pending', caseRef: ''
}

const priorityConfig = {
  High: { color: styles.priorityHigh, dot: styles.dotHigh },
  Medium: { color: styles.priorityMedium, dot: styles.dotMedium },
  Low: { color: styles.priorityLow, dot: styles.dotLow },
}

const statusConfig = {
  Pending: styles.statusPending,
  'In Progress': styles.statusProgress,
  Completed: styles.statusCompleted,
}

const getDueDiff = (date) => {
  if (!date) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const due = new Date(date); due.setHours(0, 0, 0, 0)
  const diff = Math.round((due - now) / 86400000)
  return diff
}

const getDueLabel = (date) => {
  const diff = getDueDiff(date)
  if (diff === null) return null
  if (diff < 0) return { label: `Overdue by ${Math.abs(diff)}d`, cls: styles.dueOverdue }
  if (diff === 0) return { label: 'Due Today', cls: styles.dueToday }
  if (diff === 1) return { label: 'Due Tomorrow', cls: styles.dueSoon }
  if (diff <= 3) return { label: `Due in ${diff}d`, cls: styles.dueSoon }
  return { label: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), cls: styles.dueNormal }
}

export default function Tasks() {
  const { t } = useTranslation()
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [loading, setLoading] = useState(false)

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks')
      setTasks(data)
    } catch { toast.error('Failed to load tasks') }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editId) {
        await API.put(`/tasks/${editId}`, form)
        toast.success('Task updated!')
      } else {
        await API.post('/tasks', form)
        toast.success('Task created!')
      }
      setForm(empty); setShowForm(false); setEditId(null)
      fetchTasks()
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    await API.delete(`/tasks/${id}`)
    toast.success('Task deleted')
    fetchTasks()
  }

  const handleToggle = async (id) => {
    await API.patch(`/tasks/${id}/toggle`)
    fetchTasks()
  }

  const handleEdit = (task) => {
    setForm({
      title: task.title, description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority, status: task.status,
      caseRef: task.caseRef || ''
    })
    setEditId(task._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setShowForm(false); setEditId(null); setForm(empty)
  }

  const filtered = tasks.filter(t => {
    const statusMatch = filter === 'All' || t.status === filter
    const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter
    return statusMatch && priorityMatch
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => getDueDiff(t.dueDate) !== null && getDueDiff(t.dueDate) < 0 && t.status !== 'Completed').length,
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">Tasks</h2>
          <p className="page-subtitle">{tasks.length} total tasks</p>
        </div>
        <button className="btn-primary" onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? <><Close sx={{ fontSize: 15 }} /> Cancel</> : <><Add sx={{ fontSize: 15 }} /> New Task</>}
        </button>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statGrid}>
        {[
          { label: 'Total', val: stats.total, cls: styles.statBlue },
          { label: 'Pending', val: stats.pending, cls: styles.statAmber },
          { label: 'In Progress', val: stats.inProgress, cls: styles.statTeal },
          { label: 'Completed', val: stats.completed, cls: styles.statGreen },
          { label: 'Overdue', val: stats.overdue, cls: styles.statRed },
        ].map((s, i) => (
          <div key={i} className={`${styles.statCard} ${s.cls}`}>
            <div className={styles.statVal}>{s.val}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FORM */}
      {showForm && (
        <div className={`card ${styles.formCard} animate-scale`}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>{editId ? 'Edit Task' : 'New Task'}</h3>
            <button className="icon-btn" onClick={resetForm}><Close sx={{ fontSize: 16 }} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-full">
                <label className="form-label">Task Title *</label>
                <input className="input" placeholder="e.g. Prepare witness statements"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input
                  className="input"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select className="input" value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="input" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['Pending', 'In Progress', 'Completed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Related Case (optional)</label>
                <input className="input" placeholder="e.g. Land Dispute — Ravi Kumar"
                  value={form.caseRef} onChange={e => setForm({ ...form, caseRef: e.target.value })} />
              </div>
              <div className="form-full">
                <label className="form-label">Description</label>
                <textarea className="input" style={{ height: '72px', resize: 'vertical' }}
                  placeholder="Task details..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editId ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <FilterList sx={{ fontSize: 15, color: 'var(--text-muted)' }} />
          {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
            <button key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          <Flag sx={{ fontSize: 15, color: 'var(--text-muted)' }} />
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p}
              className={`${styles.filterBtn} ${priorityFilter === p ? styles.filterActive : ''}`}
              onClick={() => setPriorityFilter(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* TASK LIST */}
      <div className={styles.taskList}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <CheckCircle sx={{ fontSize: 48, color: 'var(--text-muted)' }} className="empty-icon" />
            <p className="empty-title">No tasks found</p>
            <p className="empty-subtitle">Click New Task to add your first task</p>
          </div>
        ) : filtered.map(task => {
          const due = getDueLabel(task.dueDate)
          const isCompleted = task.status === 'Completed'
          return (
            <div key={task._id}
              className={`card ${styles.taskCard} ${isCompleted ? styles.taskCompleted : ''} animate-fade`}>
              <div className={styles.taskLeft}>
                <button className={styles.checkBtn} onClick={() => handleToggle(task._id)}>
                  {isCompleted
                    ? <CheckCircle sx={{ fontSize: 22, color: 'var(--success)' }} />
                    : <RadioButtonUnchecked sx={{ fontSize: 22, color: 'var(--text-muted)' }} />
                  }
                </button>
              </div>

              <div className={styles.taskBody}>
                <div className={styles.taskTopRow}>
                  <h3 className={`${styles.taskTitle} ${isCompleted ? styles.taskTitleDone : ''}`}>
                    {task.title}
                  </h3>
                  <div className={styles.taskBadges}>
                    <span className={`${styles.priorityBadge} ${priorityConfig[task.priority]?.color}`}>
                      <Flag sx={{ fontSize: 11 }} /> {task.priority}
                    </span>
                    <span className={`${styles.statusBadge} ${statusConfig[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p className={styles.taskDesc}>{task.description}</p>
                )}

                <div className={styles.taskMeta}>
                  {task.caseRef && (
                    <span className={styles.metaTag}>
                      <span style={{ fontSize: 11 }}>Case:</span> {task.caseRef}
                    </span>
                  )}
                  {due && (
                    <span className={`${styles.dueBadge} ${due.cls}`}>
                      <CalendarToday sx={{ fontSize: 11 }} /> {due.label}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.taskActions}>
                <button className="icon-btn" title="Edit" onClick={() => handleEdit(task)}>
                  <Edit sx={{ fontSize: 15 }} />
                </button>
                <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(task._id)}>
                  <Delete sx={{ fontSize: 15 }} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}