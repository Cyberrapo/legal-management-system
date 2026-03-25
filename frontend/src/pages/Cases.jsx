import { useEffect, useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import DocumentViewer from '../components/DocumentViewer'
import styles from './Cases.module.css'

const empty = { title: '', description: '', clientName: '', caseType: 'Civil', status: 'Open' }
const badgeClass = { Open: styles.badgeOpen, 'In Progress': styles.badgeProgress, Closed: styles.badgeClosed }

export default function Cases() {
  const [cases, setCases] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [expandedCase, setExpandedCase] = useState(null)

  const fetchCases = async () => {
    try {
      const { data } = await API.get('/cases')
      setCases(data)
    } catch { toast.error('Failed to load cases') }
  }

  useEffect(() => { fetchCases() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      if (editId) {
        await API.put(`/cases/${editId}`, form)
        toast.success('Case updated!')
      } else {
        const { data } = await API.post('/cases', form)
        if (files.length > 0) {
          const fd = new FormData()
          files.forEach(f => fd.append('documents', f))
          await API.post(`/documents/${data._id}/upload`, fd)
          toast.success(`Case created with ${files.length} document(s)!`)
        } else {
          toast.success('Case created!')
        }
      }
      setForm(empty); setShowForm(false); setEditId(null); setFiles([])
      fetchCases()
    } catch { toast.error('Something went wrong') }
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this case?')) return
    await API.delete(`/cases/${id}`)
    toast.success('Case deleted')
    fetchCases()
  }

  const handleDeleteDoc = async (caseId, docId) => {
    if (!confirm('Delete this document?')) return
    try {
      await API.delete(`/documents/${caseId}/doc/${docId}`)
      toast.success('Document deleted')
      fetchCases()
    } catch { toast.error('Failed to delete document') }
  }

  const handleEdit = (c) => {
    setForm({ title: c.title, description: c.description, clientName: c.clientName, caseType: c.caseType, status: c.status })
    setEditId(c._id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(selected)
    toast.success(`${selected.length} file(s) selected`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Cases</h2>
          <p className={styles.subtitle}>{cases.length} total cases</p>
        </div>
        <button className={`${styles.btn} ${showForm ? styles.btnCancel : ''}`}
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); setFiles([]) }}>
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
            <textarea placeholder="Brief description of the case..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          {!editId && (
            <div className={`${styles.inputGroup} ${styles.formFull}`}>
              <label>Upload Documents (select multiple)</label>
              <input type="file" multiple
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.docx" />
              {files.length > 0 && (
                <div className={styles.filePreview}>
                  {files.map((f, i) => (
                    <span key={i} className={styles.fileTag}>📎 {f.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className={styles.formActions}>
            <button type="button" className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => { setShowForm(false); setEditId(null); setForm(empty); setFiles([]) }}>
              Cancel
            </button>
            <button type="submit" className={styles.btn} disabled={uploading}>
              {uploading ? 'Saving...' : editId ? '✓ Update Case' : '+ Create Case'}
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
              <div className={styles.docsSection}>
                <button className={styles.docsToggle}
                  onClick={() => setExpandedCase(expandedCase === c._id ? null : c._id)}>
                  📎 {c.documents.length} Document{c.documents.length > 1 ? 's' : ''}
                  {expandedCase === c._id ? ' ▲' : ' ▼'}
                </button>
                {expandedCase === c._id && (
                  <div className={styles.docsList}>
                    {c.documents.map(doc => (
                      <DocumentViewer
                        key={doc._id}
                        doc={doc}
                        onDelete={(docId) => handleDeleteDoc(c._id, docId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <button onClick={() => handleEdit(c)} className={styles.actionBtn}>✏️ Edit</button>
              <button onClick={() => handleDelete(c._id)}
                className={`${styles.actionBtn} ${styles.actionDel}`}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}