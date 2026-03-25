import { useEffect, useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Appointments.module.css'

const empty = { title: '', clientName: '', date: '', time: '', notes: '', status: 'Scheduled' }

const badgeClass = {
  Scheduled: styles.badgeScheduled,
  Completed: styles.badgeCompleted,
  Cancelled: styles.badgeCancelled
}

export default function Appointments() {
  const [appts, setAppts] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const fetchAppts = async () => {
    try {
      const { data } = await API.get('/appointments')
      setAppts(data)
    } catch { toast.error('Failed to load appointments') }
  }

  useEffect(() => { fetchAppts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await API.put(`/appointments/${editId}`, form)
        toast.success('Appointment updated!')
      } else {
        await API.post('/appointments', form)
        toast.success('Appointment booked!')
      }
      setForm(empty); setShowForm(false); setEditId(null)
      fetchAppts()
    } catch { toast.error('Something went wrong') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    await API.delete(`/appointments/${id}`)
    toast.success('Appointment cancelled')
    fetchAppts()
  }

  const handleEdit = (a) => {
    setForm({
      title: a.title,
      clientName: a.clientName,
      date: a.date?.split('T')[0],
      time: a.time,
      notes: a.notes || '',
      status: a.status
    })
    setEditId(a._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Appointments</h2>
          <p className={styles.subtitle}>{appts.length} total appointments</p>
        </div>
        <button
          className={`${styles.btn} ${showForm ? styles.btnCancel : ''}`}
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty) }}>
          {showForm ? '✕ Cancel' : '+ New Appointment'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Appointment Title</label>
            <input placeholder="e.g. Case hearing, Client meeting"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Client Name</label>
            <input placeholder="Client full name"
              value={form.clientName}
              onChange={e => setForm({...form, clientName: e.target.value})} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Date</label>
            <input type="date" value={form.date}
              onChange={e => setForm({...form, date: e.target.value})} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Time</label>
            <input type="time" value={form.time}
              onChange={e => setForm({...form, time: e.target.value})} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Status</label>
            <select value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}>
              {['Scheduled', 'Completed', 'Cancelled'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className={`${styles.inputGroup} ${styles.formFull}`}>
            <label>Notes (optional)</label>
            <textarea placeholder="Any additional notes..."
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div className={styles.formActions}>
            <button type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => { setShowForm(false); setEditId(null); setForm(empty) }}>
              Cancel
            </button>
            <button type="submit" className={styles.btn}>
              {editId ? '✓ Update' : '+ Book Appointment'}
            </button>
          </div>
        </form>
      )}

      <div className={styles.list}>
        {appts.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📅</span>
            <p className={styles.emptyText}>No appointments yet</p>
            <p className={styles.emptySubtext}>Click "+ New Appointment" to book your first one</p>
          </div>
        ) : appts.map(a => (
          <div key={a._id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <span className={`${styles.badge} ${badgeClass[a.status]}`}>
                {a.status}
              </span>
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>👤</span> {a.clientName}
              </div>
              <div className={styles.dateTimeRow}>
                <div className={styles.dateTimePill}>
                  📅 {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className={styles.dateTimePill}>
                  🕐 {a.time}
                </div>
              </div>
            </div>
            {a.notes && <p className={styles.notes}>📝 {a.notes}</p>}
            <div className={styles.actions}>
              <button onClick={() => handleEdit(a)} className={styles.actionBtn}>
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(a._id)}
                className={`${styles.actionBtn} ${styles.actionDel}`}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}