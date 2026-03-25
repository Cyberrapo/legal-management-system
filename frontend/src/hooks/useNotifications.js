import { useEffect } from 'react'
import API from '../api/axios'

export const useNotifications = () => {

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const sendNotification = (title, body, urgency = 'normal') => {
    if (Notification.permission !== 'granted') return
    const icons = { urgent: '🔴', warning: '🟡', normal: '🟢' }
    new Notification(`${icons[urgency]} ${title}`, {
      body,
      icon: '/favicon.ico',
    })
  }

  const checkHearings = async () => {
    try {
      await requestPermission()
      const { data } = await API.get('/cases/hearings/upcoming')
      if (!data.length) return

      const now = new Date()

      data.forEach(c => {
        const hearing = new Date(c.hearingDate)
        const diffMs = hearing - now
        const diffHours = diffMs / (1000 * 60 * 60)
        const diffDays = diffMs / (1000 * 60 * 60 * 24)

        if (diffHours <= 24) {
          sendNotification(
            `Hearing Today/Tomorrow: ${c.title}`,
            `Client: ${c.clientName} | Time: ${c.hearingTime || 'Not set'}`,
            'urgent'
          )
        } else if (diffDays <= 3) {
          sendNotification(
            `Hearing in ${Math.ceil(diffDays)} days: ${c.title}`,
            `Client: ${c.clientName} | Date: ${hearing.toLocaleDateString()}`,
            'warning'
          )
        } else {
          sendNotification(
            `Upcoming Hearing: ${c.title}`,
            `Client: ${c.clientName} | Date: ${hearing.toLocaleDateString()}`,
            'normal'
          )
        }
      })
    } catch (err) {
      console.error('Notification error:', err)
    }
  }

  useEffect(() => {
    checkHearings()
    const interval = setInterval(checkHearings, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { checkHearings }
}