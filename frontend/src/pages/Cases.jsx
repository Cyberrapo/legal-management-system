import { useEffect, useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Cases.module.css'

const empty = { title: '', description: '', clientName: '', caseType: 'Civil', status: 'Open' }

export default function Cases() {
  const [cases, setCases] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [file, setFile] = useState(null)

  const fetchCases = async () => {
    const { data } = await API.get('/cases')
    setCases(data)
  }

  useEffect(() => { fetchCases() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await API.put(`/cases/${editId}`, form)
        toast.success('Case updated!')
      } else {
        const { data } = await API.post('/cases', form)
        if (file) {
          const fd = new FormData()
          fd.append('document', file)
          await API.post(`/documents/${data._id}/upload`, fd)
        }
        toast.success('Case created!')
      }
      setForm(empty); setShowForm(false); setEditId(null); setFile(null)
      fetchCases()
    } catch { toast.error('Something went wrong') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this case?')) return
    await API.delete(`/cases/${id}`)
    toast.success('Case deleted')
    fetchCases()
  }

  const handleEdit = (c) => {
    setForm({ title: c.title, description: c.description, clientName: c.clientName, caseType: c.caseType, status: c.status })
    setEditId(c._id); setShowForm(true)
  }

  const statusColor = { Open: '#e94560', 'In Progress': '#f5a623', Closed: '#27ae60' }

  return (
    <div>
      <div className={styles.header}>
        <h2>Cases</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty) }}>
          {showForm ? 'Cancel' : '+ New Case'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input placeholder="Case Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input placeholder="Client Name" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} required />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <select value={form.caseType} onChange={e => setForm({...form, caseType: e.target.value})}>
            {['Civil','Criminal','Family','Corporate','Other'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {['Open','In Progress','Closed'].map(s => <option key={s}>{s}</option>)}
          </select>
          {!editId && <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.jpg,.png,.docx" />}
          <button type="submit">{editId ? 'Update Case' : 'Create Case'}</button>
        </form>
      )}

      <div className={styles.list}>
        {cases.length === 0 && <p className={styles.empty}>No cases yet. Create your first case!</p>}
        {cases.map(c => (
          <div key={c._id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{c.title}</h3>
              <span className={styles.badge} style={{background: statusColor[c.status]}}>{c.status}</span>
            </div>
            <p>Client: {c.clientName}</p>
            <p>Type: {c.caseType}</p>
            {c.description && <p className={styles.desc}>{c.description}</p>}
            {c.documents?.length > 0 && (
              <div className={styles.docs}>
                {c.documents.map((d, i) => (
                  <a key={i} href={d.url} target="_blank" rel="noreferrer">View Doc {i+1}</a>
                ))}
              </div>
            )}
            <div className={styles.actions}>
              <button onClick={() => handleEdit(c)}>Edit</button>
              <button onClick={() => handleDelete(c._id)} className={styles.del}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}