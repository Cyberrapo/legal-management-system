import { useState } from 'react'
import { Send, Clock, FileText, Bell, RefreshCw, Plus, MessageSquare } from 'lucide-react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './CaseTimeline.module.css'

const typeConfig = {
  created:  { icon: <Plus size={14}/>,         color: 'green',  label: 'Created'  },
  updated:  { icon: <RefreshCw size={14}/>,     color: 'blue',   label: 'Updated'  },
  document: { icon: <FileText size={14}/>,      color: 'purple', label: 'Document' },
  hearing:  { icon: <Bell size={14}/>,          color: 'amber',  label: 'Hearing'  },
  status:   { icon: <RefreshCw size={14}/>,     color: 'teal',   label: 'Status'   },
  note:     { icon: <MessageSquare size={14}/>, color: 'gray',   label: 'Note'     },
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function CaseTimeline({ caseId, timeline = [], onUpdate }) {
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState(false)
  const [showNote, setShowNote] = useState(false)

  const sorted = [...timeline].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setAdding(true)
    try {
      await API.post(`/cases/${caseId}/timeline/note`, { note })
      toast.success('Note added!')
      setNote('')
      setShowNote(false)
      onUpdate()
    } catch {
      toast.error('Failed to add note')
    }
    setAdding(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Clock size={16} className={styles.headerIcon} />
          <span className={styles.headerTitle}>Case Timeline</span>
          <span className={styles.count}>{timeline.length} events</span>
        </div>
        <button className={styles.addNoteBtn}
          onClick={() => setShowNote(!showNote)}>
          <MessageSquare size={13} />
          {showNote ? 'Cancel' : 'Add Note'}
        </button>
      </div>

      {showNote && (
        <form className={styles.noteForm} onSubmit={handleAddNote}>
          <textarea
            className={styles.noteInput}
            placeholder="Add a note to this case timeline..."
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className={styles.noteActions}>
            <button type="button" className="btn-ghost"
              style={{fontSize:13, padding:'7px 14px'}}
              onClick={() => setShowNote(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary"
              style={{fontSize:13, padding:'7px 14px'}}
              disabled={adding || !note.trim()}>
              <Send size={13} />
              {adding ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <Clock size={32} strokeWidth={1} />
          <p>No timeline events yet</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {sorted.map((event, i) => {
            const config = typeConfig[event.type] || typeConfig.updated
            return (
              <div key={event._id || i} className={styles.event}>
                <div className={`${styles.dot} ${styles[config.color]}`}>
                  {config.icon}
                </div>
                <div className={styles.line} />
                <div className={styles.content}>
                  <div className={styles.eventTop}>
                    <span className={`${styles.badge} ${styles[`badge_${config.color}`]}`}>
                      {config.label}
                    </span>
                    <span className={styles.time}>{formatDate(event.timestamp)}</span>
                  </div>
                  <p className={styles.action}>{event.action}</p>
                  {event.description && (
                    <p className={styles.desc}>{event.description}</p>
                  )}
                  {event.performedBy && (
                    <p className={styles.by}>by {event.performedBy}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}