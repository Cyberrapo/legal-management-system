import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ cases: 0, appointments: 0, open: 0 })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [casesRes, apptRes] = await Promise.all([
          API.get('/cases'),
          API.get('/appointments')
        ])
        const openCases = casesRes.data.filter(c => c.status === 'Open').length
        setStats({ cases: casesRes.data.length, appointments: apptRes.data.length, open: openCases })
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>
          {greeting}, <span>{user?.name?.split(' ')[0]}!</span>
        </h1>
        <p className={styles.subtitle}>Here's what's happening with your cases today.</p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardIcon}>📁</span>
          <div className={styles.cardNumber}>{stats.cases}</div>
          <div className={styles.cardLabel}>Total Cases</div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>🔓</span>
          <div className={styles.cardNumber}>{stats.open}</div>
          <div className={styles.cardLabel}>Open Cases</div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>📅</span>
          <div className={styles.cardNumber}>{stats.appointments}</div>
          <div className={styles.cardLabel}>Appointments</div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>⚡ Quick Actions</div>
          <div className={styles.quickLinks}>
            <div className={styles.quickLink} onClick={() => navigate('/cases')}>
              <span>📁</span> Add new case
            </div>
            <div className={styles.quickLink} onClick={() => navigate('/appointments')}>
              <span>📅</span> Book appointment
            </div>
            <div className={styles.quickLink} onClick={() => navigate('/chat')}>
              <span>🤖</span> Ask AI assistant
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>💡 Tips</div>
          <div className={styles.tipsList}>
            <div className={styles.tip}>
              <div className={styles.tipDot}/>
              Upload documents directly to cases for easy access
            </div>
            <div className={styles.tip}>
              <div className={styles.tipDot}/>
              Use the AI assistant for quick legal research
            </div>
            <div className={styles.tip}>
              <div className={styles.tipDot}/>
              Track case status to stay organised
            </div>
            <div className={styles.tip}>
              <div className={styles.tipDot}/>
              Book appointments to manage client meetings
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}