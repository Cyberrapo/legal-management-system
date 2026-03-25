import { useEffect, useState } from 'react'
import API from '../api/axios'
import styles from './Hearings.module.css'

export default function Hearings() {
  const [hearings, setHearings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/cases/hearings/upcoming')
        setHearings(data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const getUrgency = (dateStr) => {
    const now = new Date()
    const hearing = new Date(dateStr)
    const diffDays = (hearing - now) / (1000 * 60 * 60 * 24)
    if (diffDays <= 1) return 'urgent'
    if (diffDays <= 3) return 'warning'
    return 'normal'
  }

  const getUrgencyLabel = (dateStr) => {
    const now = new Date()
    const hearing = new Date(dateStr)
    const diffDays = (hearing - now) / (1000 * 60 * 60 * 24)
    const diffHours = diffDays * 24
    if (diffHours <= 24) return '🔴 Today / Tomorrow'
    if (diffDays <= 3) return '🟡 In 2-3 days'
    return '🟢 This week'
  }

  const getDaysLeft = (dateStr) => {
    const now = new Date()
    const hearing = new Date(dateStr)
    const diffDays = Math.ceil((hearing - now) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `In ${diffDays} days`
  }

  if (loading) return (
    <div className={styles.loading}>
      <span>Loading hearings...</span>
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Upcoming Hearings</h2>
          <p className={styles.subtitle}>
            {hearings.length} hearing{hearings.length !== 1 ? 's' : ''} in the next 7 days
          </p>
        </div>
      </div>

      {hearings.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🎉</span>
          <p className={styles.emptyText}>No upcoming hearings</p>
          <p className={styles.emptySubtext}>
            Add hearing dates to your cases to see them here
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {hearings.map(c => (
            <div key={c._id}
              className={`${styles.card} ${styles[getUrgency(c.hearingDate)]}`}>
              <div className={styles.cardLeft}>
                <div className={styles.dateBox}>
                  <span className={styles.dateDay}>
                    {new Date(c.hearingDate).toLocaleDateString('en-IN', { day: '2-digit' })}
                  </span>
                  <span className={styles.dateMonth}>
                    {new Date(c.hearingDate).toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                  <span className={styles.dateYear}>
                    {new Date(c.hearingDate).getFullYear()}
                  </span>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.cardTop}>
                  <h3 className={styles.caseTitle}>{c.title}</h3>
                  <span className={styles.urgencyBadge}>
                    {getUrgencyLabel(c.hearingDate)}
                  </span>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>👤 {c.clientName}</span>
                  <span className={styles.metaItem}>⚖️ {c.caseType}</span>
                  {c.hearingTime && (
                    <span className={styles.metaItem}>🕐 {c.hearingTime}</span>
                  )}
                </div>
                {c.hearingNotes && (
                  <p className={styles.notes}>📝 {c.hearingNotes}</p>
                )}
                <div className={styles.countdown}>
                  ⏰ {getDaysLeft(c.hearingDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}