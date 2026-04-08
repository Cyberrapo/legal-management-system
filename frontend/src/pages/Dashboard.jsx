import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FolderOpen, Unlock, Calendar, ArrowRight, Bell, MessageSquare, FileText } from 'lucide-react'
import API from '../api/axios'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ cases: 0, appointments: 0, open: 0 })
  const [hearings, setHearings] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const [casesRes, apptRes, hearingRes] = await Promise.all([
          API.get('/cases'), API.get('/appointments'),
          API.get('/cases/hearings/upcoming')
        ])
        setStats({
          cases: casesRes.data.length,
          appointments: apptRes.data.length,
          open: casesRes.data.filter(c => c.status === 'Open').length
        })
        setHearings(hearingRes.data.slice(0, 3))
      } catch {}
    }
    fetch()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statCards = [
    { label: 'Total Cases', value: stats.cases, icon: <FolderOpen size={22}/>, color: 'purple' },
    { label: 'Open Cases', value: stats.open, icon: <Unlock size={22}/>, color: 'blue' },
    { label: 'Appointments', value: stats.appointments, icon: <Calendar size={22}/>, color: 'green' },
  ]

  const quickActions = [
    { icon: <FolderOpen size={16}/>, label: 'Add new case', to: '/cases' },
    { icon: <Calendar size={16}/>, label: 'Book appointment', to: '/appointments' },
    { icon: <Bell size={16}/>, label: 'View hearings', to: '/hearings' },
    { icon: <MessageSquare size={16}/>, label: 'Ask AI assistant', to: '/chat' },
    { icon: <FileText size={16}/>, label: 'Generate document', to: '/documents' },
  ]

  return (
    <div className="animate-fade">
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{greeting}, <span className={styles.name}>{user?.name?.split(' ')[0]}</span></h1>
          <p className={styles.sub}>Here is your legal practice overview</p>
        </div>
      </div>

      <div className={styles.statGrid}>
        {statCards.map((s, i) => (
          <div key={i} className={`card ${styles.statCard} ${styles[s.color]}`}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statVal}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>⚡ Quick Actions</h3>
          <div className={styles.quickList}>
            {quickActions.map((a, i) => (
              <button key={i} className={styles.quickItem} onClick={() => navigate(a.to)}>
                <span className={styles.quickIcon}>{a.icon}</span>
                <span className={styles.quickLabel}>{a.label}</span>
                <ArrowRight size={14} className={styles.quickArrow} />
              </button>
            ))}
          </div>
        </div>

        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>🔔 Upcoming Hearings</h3>
          {hearings.length === 0 ? (
            <p className={styles.noHearings}>No hearings in the next 7 days</p>
          ) : hearings.map(h => (
            <div key={h._id} className={styles.hearingItem}>
              <div className={styles.hearingDate}>
                <span className={styles.hearingDay}>{new Date(h.hearingDate).toLocaleDateString('en-IN', {day:'2-digit'})}</span>
                <span className={styles.hearingMonth}>{new Date(h.hearingDate).toLocaleDateString('en-IN', {month:'short'})}</span>
              </div>
              <div className={styles.hearingInfo}>
                <p className={styles.hearingTitle}>{h.title}</p>
                <p className={styles.hearingClient}>{h.clientName} {h.hearingTime && `· ${h.hearingTime}`}</p>
              </div>
            </div>
          ))}
          <button className={styles.viewAll} onClick={() => navigate('/hearings')}>
            View all hearings <ArrowRight size={13}/>
          </button>
        </div>
      </div>
    </div>
  )
}