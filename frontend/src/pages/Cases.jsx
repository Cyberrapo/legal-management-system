import { useEffect, useState, useRef } from 'react'
import {
  Plus, X, Edit2, Trash2, Download, Eye, FileText,
  Image, File, ChevronDown, ChevronUp, Upload,
  Paperclip, Check, FolderOpen, Clock
} from 'lucide-react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import CaseTimeline from '../components/CaseTimeline'
import styles from './Cases.module.css'

const empty = {
  title: '', description: '', clientName: '',
  caseType: 'Civil', status: 'Open',
  hearingDate: '', hearingTime: '', hearingNotes: ''
}

const statusBadge = {
  Open: 'badge badge-open',
  'In Progress': 'badge badge-progress',
  Closed: 'badge badge-closed'
}

const getFileIcon = (doc) => {
  if (doc.fileType === 'application/pdf' || doc.name?.endsWith('.pdf'))
    return <FileText size={16} />
  if (doc.fileType?.startsWith('image/') || doc.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    return <Image size={16} />
  return <File size={16} />
}

export default function Cases() {
  const [cases, setCases] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [expandedCase, setExpandedCase] = useState(null)
  const [expandedTimeline, setExpandedTimeline] = useState(null)
  const [viewingDoc, setViewingDoc] = useState(null)
  const [deletingDoc, setDeletingDoc] = useState(null)
  const fileRef = useRef()

  const fetchCases = async () => {
    try {
      const { data } = await API.get('/cases')
      setCases(data)
    } catch {
      toast.error('Failed to load cases')
    }
  }

  useEffect(() => { fetchCases() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      if (editId) {
        await API.put(`/cases/${editId}`, form)
        if (files.length > 0) {
          const fd = new FormData()
          files.forEach(f => fd.append('documents', f))
          await API.post(`/documents/${editId}/upload`, fd)
          toast.success(`Case updated with ${files.length} new document(s)!`)
        } else {
          toast.success('Case updated!')
        }
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
      setForm(empty)
      setShowForm(false)
      setEditId(null)
      setFiles([])
      fetchCases()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this case and all its documents?')) return
    try {
      await API.delete(`/cases/${id}`)
      toast.success('Case deleted')
      fetchCases()
    } catch {
      toast.error('Failed to delete case')
    }
  }

  const handleDeleteDoc = async (caseId, docId) => {
    setDeletingDoc(docId)
    try {
      await API.delete(`/documents/${caseId}/doc/${docId}`)
      toast.success('Document removed')
      fetchCases()
    } catch {
      toast.error('Failed to remove document')
    }
    setDeletingDoc(null)
  }

  const handleEdit = (c) => {
    setForm({
      title: c.title,
      description: c.description || '',
      clientName: c.clientName,
      caseType: c.caseType,
      status: c.status,
      hearingDate: c.hearingDate ? c.hearingDate.split('T')[0] : '',
      hearingTime: c.hearingTime || '',
      hearingNotes: c.hearingNotes || ''
    })
    setEditId(c._id)
    setShowForm(true)
    setFiles([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddFile = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm(empty)
    setFiles([])
  }

  const toggleDocs = (id) => setExpandedCase(prev => prev === id ? null : id)
  const toggleTimeline = (id) => setExpandedTimeline(prev => prev === id ? null : id)

  return (
    <div className="animate-fade">

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Cases</h2>
          <p className="page-subtitle">
            {cases.length} case{cases.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button className="btn-primary"
          onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm
            ? <><X size={15} /> Cancel</>
            : <><Plus size={15} /> New Case</>
          }
        </button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div className={`card ${styles.formCard} animate-scale`}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>
              {editId ? '✏️ Edit Case' : '📁 New Case'}
            </h3>
            <button className="icon-btn" onClick={resetForm}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* Title */}
              <div>
                <label className="form-label">Case Title *</label>
                <input className="input"
                  placeholder="e.g. Property Dispute — Sharma vs State"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  required />
              </div>

              {/* Client */}
              <div>
                <label className="form-label">Client Name *</label>
                <input className="input"
                  placeholder="Full name of client"
                  value={form.clientName}
                  onChange={e => setForm({...form, clientName: e.target.value})}
                  required />
              </div>

              {/* Case Type */}
              <div>
                <label className="form-label">Case Type</label>
                <select className="input" value={form.caseType}
                  onChange={e => setForm({...form, caseType: e.target.value})}>
                  {['Civil','Criminal','Family','Corporate','Other'].map(t =>
                    <option key={t}>{t}</option>
                  )}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="form-label">Status</label>
                <select className="input" value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}>
                  {['Open','In Progress','Closed'].map(s =>
                    <option key={s}>{s}</option>
                  )}
                </select>
              </div>

              {/* Description */}
              <div className="form-full">
                <label className="form-label">Description</label>
                <textarea className="input"
                  style={{height:'80px', resize:'vertical'}}
                  placeholder="Brief case description..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              {/* Hearing Date */}
              <div>
                <label className="form-label">Hearing Date</label>
                <input className="input" type="date"
                  value={form.hearingDate}
                  onChange={e => setForm({...form, hearingDate: e.target.value})} />
              </div>

              {/* Hearing Time */}
              <div>
                <label className="form-label">Hearing Time</label>
                <input className="input" type="time"
                  value={form.hearingTime}
                  onChange={e => setForm({...form, hearingTime: e.target.value})} />
              </div>

              {/* Hearing Notes */}
              <div className="form-full">
                <label className="form-label">Hearing Notes</label>
                <input className="input"
                  placeholder="e.g. Court Room 3, Judge Sharma"
                  value={form.hearingNotes}
                  onChange={e => setForm({...form, hearingNotes: e.target.value})} />
              </div>

              {/* Document Upload */}
              <div className="form-full">
                <label className="form-label">
                  {editId ? 'Add More Documents' : 'Upload Documents'}
                </label>
                <div className={styles.uploadZone}
                  onClick={() => fileRef.current?.click()}>
                  <Upload size={22} className={styles.uploadIcon} />
                  <p className={styles.uploadText}>Click to browse files</p>
                  <p className={styles.uploadHint}>
                    PDF, JPG, PNG, DOCX — add one by one or multiple at once
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    style={{display:'none'}}
                    onChange={handleAddFile}
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                  />
                </div>

                {files.length > 0 && (
                  <div className={styles.fileList}>
                    {files.map((f, i) => (
                      <div key={i} className={styles.fileItem}>
                        <Paperclip size={13} className={styles.fileIcon} />
                        <span className={styles.fileName}>{f.name}</span>
                        <span className={styles.fileSize}>
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                        <button type="button"
                          className="icon-btn danger"
                          style={{width:26, height:26}}
                          onClick={() => removeFile(i)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? (
                  <><span className={styles.spinner} /> Saving...</>
                ) : editId ? (
                  <><Check size={15} /> Update Case</>
                ) : (
                  <><Plus size={15} /> Create Case</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── CASES GRID ── */}
      <div className={styles.caseGrid}>
        {cases.length === 0 ? (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <FolderOpen size={52} strokeWidth={1} className="empty-icon" />
            <p className="empty-title">No cases yet</p>
            <p className="empty-subtitle">Click "+ New Case" to get started</p>
          </div>
        ) : cases.map(c => (
          <div key={c._id} className={`card ${styles.caseCard} animate-fade`}>

            {/* Card Top Row — Status + Actions */}
            <div className={styles.cardTopRow}>
              <span className={statusBadge[c.status]}>{c.status}</span>
              <div className={styles.cardActions}>
                <button className="icon-btn" title="Edit case"
                  onClick={() => handleEdit(c)}>
                  <Edit2 size={14} />
                </button>
                <button className="icon-btn danger" title="Delete case"
                  onClick={() => handleDelete(c._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Case Title */}
            <h3 className={styles.caseTitle}>{c.title}</h3>

            {/* Meta Tags */}
            <div className={styles.caseMeta}>
              <span className={styles.metaItem}>👤 {c.clientName}</span>
              <span className={styles.metaItem}>⚖️ {c.caseType}</span>
              <span className={styles.metaItem}>
                📅 {new Date(c.createdAt).toLocaleDateString('en-IN')}
              </span>
              {c.hearingDate && (
                <span className={`${styles.metaItem} ${styles.hearingTag}`}>
                  🔔 {new Date(c.hearingDate).toLocaleDateString('en-IN')}
                  {c.hearingTime && ` @ ${c.hearingTime}`}
                </span>
              )}
            </div>

            {/* Description */}
            {c.description && (
              <p className={styles.caseDesc}>{c.description}</p>
            )}

            {/* Hearing Notes */}
            {c.hearingNotes && (
              <p className={styles.hearingNotes}>📝 {c.hearingNotes}</p>
            )}

            {/* ── DOCUMENTS ── */}
            {c.documents?.length > 0 && (
              <div className={styles.docsSection}>
                <button className={styles.docsToggle}
                  onClick={() => toggleDocs(c._id)}>
                  <Paperclip size={13} />
                  <span>
                    {c.documents.length} Document{c.documents.length > 1 ? 's' : ''}
                  </span>
                  {expandedCase === c._id
                    ? <ChevronUp size={13} />
                    : <ChevronDown size={13} />
                  }
                </button>

                {expandedCase === c._id && (
                  <div className={styles.docsList}>
                    {c.documents.map(doc => (
                      <div key={doc._id} className={styles.docItem}>
                        <span className={styles.docIcon}>{getFileIcon(doc)}</span>
                        <span className={styles.docName}>
                          {doc.name || 'Document'}
                        </span>
                        <div className={styles.docActions}>
                          <button className="icon-btn info" title="View document"
                            onClick={() => setViewingDoc(doc)}>
                            <Eye size={13} />
                          </button>
                          <a href={doc.url} download
                            target="_blank" rel="noreferrer"
                            className="icon-btn success"
                            title="Download document">
                            <Download size={13} />
                          </a>
                          <button className="icon-btn danger"
                            title="Delete document"
                            disabled={deletingDoc === doc._id}
                            onClick={() => handleDeleteDoc(c._id, doc._id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TIMELINE ── */}
            <div className={styles.timelineSection}>
              <button className={styles.timelineToggle}
                onClick={() => toggleTimeline(c._id)}>
                <Clock size={13} />
                <span>
                  Timeline · {c.timeline?.length || 0} event{c.timeline?.length !== 1 ? 's' : ''}
                </span>
                {expandedTimeline === c._id
                  ? <ChevronUp size={13} />
                  : <ChevronDown size={13} />
                }
              </button>

              {expandedTimeline === c._id && (
                <CaseTimeline
                  caseId={c._id}
                  timeline={c.timeline || []}
                  onUpdate={fetchCases}
                />
              )}
            </div>

          </div>
        ))}
      </div>

      {/* ── DOCUMENT VIEWER MODAL ── */}
      {viewingDoc && (
        <div className={styles.modal} onClick={() => setViewingDoc(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                {getFileIcon(viewingDoc)}
                <span className={styles.modalTitle}>{viewingDoc.name}</span>
              </div>
              <div className={styles.modalHeaderActions}>
                <a href={viewingDoc.url} download target="_blank"
                  rel="noreferrer" className="icon-btn success" title="Download">
                  <Download size={15} />
                </a>
                <button className="icon-btn danger"
                  onClick={() => setViewingDoc(null)}>
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              {viewingDoc.fileType === 'application/pdf' ||
               viewingDoc.name?.endsWith('.pdf') ? (
                <iframe
                  src={viewingDoc.url}
                  title={viewingDoc.name}
                  className={styles.pdfFrame}
                />
              ) : viewingDoc.fileType?.startsWith('image/') ||
                viewingDoc.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.name}
                  className={styles.imgPreview}
                />
              ) : (
                <div className={styles.unsupported}>
                  <File size={52} strokeWidth={1} />
                  <p>Preview not available for this file type</p>
                  <a href={viewingDoc.url} target="_blank"
                    rel="noreferrer" className="btn-primary">
                    <Download size={14} /> Open File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}