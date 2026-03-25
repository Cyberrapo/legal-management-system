import { useEffect, useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Appointments.module.css'

const empty = { title: '', clientName: '', date: '', time: '', notes: '', status: 'Scheduled' }

export default function Appointments() {
  const [appts, setAppts] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const fetchAppts = async () => {
    const { data } = await API.get('/appointments')
    setAppts(data)
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
    setForm({ title: a.title, clientName: a.clientName, date: a.date?.split('T')[0], time: a.time, notes: a.notes || '', status: a.status })
    setEditId(a._id); setShowForm(true)
  }

  const statusColor = { Scheduled: '#0f3460', Completed: '#27ae60', Cancelled: '#e94560' }

  return (
    <div>
      <div className={styles.header}>
        <h2>Appointments</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty) }}>
          {showForm ? 'Cancel' : '+ New Appointment'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input placeholder="Title e.g. Case Hearing" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input placeholder="Client Name" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} required />
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
          <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {['Scheduled','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button type="submit">{editId ? 'Update' : 'Book Appointment'}</button>
        </form>
      )}

      <div className={styles.list}>
        {appts.length === 0 && <p className={styles.empty}>No appointments yet.</p>}
        {appts.map(a => (
          <div key={a._id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{a.title}</h3>
              <span className={styles.badge} style={{background: statusColor[a.status]}}>{a.status}</span>
            </div>
            <p>Client: {a.clientName}</p>
            <p>Date: {new Date(a.date).toLocaleDateString()} at {a.time}</p>
            {a.notes && <p className={styles.notes}>{a.notes}</p>}
            <div className={styles.actions}>
              <button onClick={() => handleEdit(a)}>Edit</button>
              <button onClick={() => handleDelete(a._id)} className={styles.del}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}