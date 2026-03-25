import { useEffect, useState } from 'react'
import API from '../api/axios'
import styles from './HearingBadge.module.css'

export default function HearingBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/cases/hearings/upcoming')
        setCount(data.length)
      } catch {}
    }
    fetch()
  }, [])

  if (count === 0) return null

  return (
    <span className={styles.badge}>{count}</span>
  )
}