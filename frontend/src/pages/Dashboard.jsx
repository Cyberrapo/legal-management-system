import { useEffect, useState } from 'react'
import API from '../api/axios'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ cases: 0, appointments: 0, open: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const [casesRes, apptRes] = await Promise.all([
        API.get('/cases'),
        API.get('/appointments')
      ])
      const openCases = casesRes.data.filter(c => c.status === 'Open').length
      setStats({ cases: casesRes.data.length, appointments: apptRes.data.length, open: openCases })
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h2 className={styles.title}>Dashboard</h2>
      <div className={styles.cards}>
        <div className={styles.card} style={{borderTop: '4px solid #e94560'}}>
          <h3>{stats.cases}</h3>
          <p>Total Cases</p>
        </div>
        <div className={styles.card} style={{borderTop: '4px solid #0f3460'}}>
          <h3>{stats.open}</h3>
          <p>Open Cases</p>
        </div>
        <div className={styles.card} style={{borderTop: '4px solid #16213e'}}>
          <h3>{stats.appointments}</h3>
          <p>Appointments</p>
        </div>
      </div>
      <div className={styles.welcome}>
        <h3>Welcome to your Legal Dashboard</h3>
        <p>Manage your cases, appointments, documents and get AI legal assistance — all in one place.</p>
      </div>
    </div>
  )
}