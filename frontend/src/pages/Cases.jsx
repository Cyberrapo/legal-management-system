import { useEffect, useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Cases.module.css'

const empty = { title: '', description: '', clientName: '', caseType: 'Civil', status: 'Open' }

const badgeClass = { Open: styles.badgeOpen, 'In Progress': styles.badgeProgress, Closed: styles.badgeClosed }

export default function Cases() {
  const [cases, setCases] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [file, setFile] = useState(null)

  const fetchCases = async () => {
    try {
      const { data } = await API.get('/cases')
      setCases(data)
    } catch { toast.error('Failed to load cases') }
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Cases</h2>
          <p className={styles.subtitle}>{cases.length} total cases</p>
        </div>
        <button className={`${styles.btn} ${showForm ? styles.btnCancel : ''}`}
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty) }}>
          {showForm ? '✕ Cancel' : '+ New Case'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Case Title</label>
            <input placeholder="e.g. Property dispute case" value={form.title}
              onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Client Name</label>
            <input placeholder="Client full name" value={form.clientName}
              onChange={e => setForm({...form, clientName: e.target.value})} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Case Type</label>
            <select value={form.caseType} onChange={e => setForm({...form, caseType: e.target.value})}>
              {['Civil','Criminal','Family','Corporate','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              {['Open','In Progress','Closed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className={`${styles.inputGroup} ${styles.formFull}`}>
            <label>Description</label>
            <textarea placeholder="Brief description of the case..." value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          {!editId && (
            <div className={`${styles.inputGroup} ${styles.formFull}`}>
              <label>Upload Document (optional)</label>
              <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.jpg,.png,.docx" />
            </div>
          )}
          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => { setShowForm(false); setEditId(null); setForm(empty) }}>
              Cancel
            </button>
            <button type="submit" className={styles.btn}>
              {editId ? '✓ Update Case' : '+ Create Case'}
            </button>
          </div>
        </form>
      )}

      <div className={styles.list}>
        {cases.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📁</span>
            <p className={styles.emptyText}>No cases yet</p>
            <p className={styles.emptySubtext}>Click "+ New Case" to add your first case</p>
          </div>
        ) : cases.map(c => (
          <div key={c._id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <span className={`${styles.badge} ${badgeClass[c.status]}`}>{c.status}</span>
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>👤</span> {c.clientName}
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>⚖️</span> {c.caseType}
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📅</span> {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>
            {c.description && <p className={styles.desc}>{c.description}</p>}
            {c.documents?.length > 0 && (
              <div className={styles.docs}>
                {c.documents.map((d, i) => (
                  <a key={i} href={d.url} target="_blank" rel="noreferrer" className={styles.docLink}>
                    📎 Document {i + 1}
                  </a>
                ))}
              </div>
            )}
            <div className={styles.actions}>
              <button onClick={() => handleEdit(c)} className={styles.actionBtn}>✏️ Edit</button>
              <button onClick={() => handleDelete(c._id)} className={`${styles.actionBtn} ${styles.actionDel}`}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}