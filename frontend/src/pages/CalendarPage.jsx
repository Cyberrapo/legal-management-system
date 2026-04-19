import { useEffect, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Today, Event,
  Gavel, CalendarMonth, Assignment, Add
} from '@mui/icons-material'
import API from '../api/axios'
import styles from './CalendarPage.module.css'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

const eventColors = {
  hearing:     { bg: 'rgba(255,107,107,0.15)', color: '#ff6b6b', border: 'rgba(255,107,107,0.3)' },
  appointment: { bg: 'rgba(79,172,254,0.15)',  color: '#4facfe', border: 'rgba(79,172,254,0.3)'  },
  task:        { bg: 'rgba(246,211,101,0.15)', color: '#f6d365', border: 'rgba(246,211,101,0.3)' },
  case:        { bg: 'rgba(108,99,255,0.15)',  color: '#8b85ff', border: 'rgba(108,99,255,0.3)'  },
}

export default function CalendarPage() {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [casesRes, apptRes, taskRes] = await Promise.all([
          API.get('/cases'),
          API.get('/appointments'),
          API.get('/tasks'),
        ])

        const allEvents = []

        casesRes.data.forEach(c => {
          if (c.hearingDate) {
            allEvents.push({
              id: c._id + '_h',
              date: c.hearingDate.split('T')[0],
              title: c.title,
              subtitle: c.clientName,
              time: c.hearingTime || '',
              type: 'hearing',
              icon: 'hearing'
            })
          }
        })

        apptRes.data.forEach(a => {
          if (a.date) {
            allEvents.push({
              id: a._id,
              date: a.date.split('T')[0],
              title: a.title,
              subtitle: a.clientName,
              time: a.time || '',
              type: 'appointment',
              icon: 'appointment'
            })
          }
        })

        taskRes.data.forEach(t => {
          if (t.dueDate && t.status !== 'Completed') {
            allEvents.push({
              id: t._id,
              date: t.dueDate.split('T')[0],
              title: t.title,
              subtitle: t.priority + ' Priority',
              time: '',
              type: 'task',
              icon: 'task'
            })
          }
        })

        setEvents(allEvents)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  const prevMonth = () => {
    setCurrent(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { ...prev, month: prev.month - 1 }
    })
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrent(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { ...prev, month: prev.month + 1 }
    })
    setSelectedDate(null)
  }

  const goToday = () => {
    setCurrent({ year: today.getFullYear(), month: today.getMonth() })
    setSelectedDate(today.toISOString().split('T')[0])
  }

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDay = (year, month) => new Date(year, month, 1).getDay()

  const getEventsForDate = (dateStr) => events.filter(e => e.date === dateStr)

  const buildCalendar = () => {
    const { year, month } = current
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDay(year, month)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1)
      const day = prevMonthDays - firstDay + i + 1
      days.push({ day, current: false, dateStr: null })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      days.push({ day: d, current: true, dateStr: `${year}-${mm}-${dd}` })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false, dateStr: null })
    }

    return days
  }

  const calendarDays = buildCalendar()
  const todayStr = today.toISOString().split('T')[0]

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  const getTypeIcon = (type) => {
    if (type === 'hearing') return <Gavel sx={{fontSize:13}}/>
    if (type === 'appointment') return <Event sx={{fontSize:13}}/>
    if (type === 'task') return <Assignment sx={{fontSize:13}}/>
    return <CalendarMonth sx={{fontSize:13}}/>
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h2 className="page-title">Calendar</h2>
          <p className="page-subtitle">Hearings, appointments and task deadlines</p>
        </div>
        <button className="btn-ghost" onClick={goToday}>
          <Today sx={{fontSize:16}}/> Today
        </button>
      </div>

      <div className={styles.layout}>

        {/* CALENDAR GRID */}
        <div className={`card ${styles.calendarCard}`}>

          {/* Month Navigation */}
          <div className={styles.calHeader}>
            <button className="icon-btn" onClick={prevMonth}>
              <ChevronLeft sx={{fontSize:20}}/>
            </button>
            <h3 className={styles.monthTitle}>
              {MONTHS[current.month]} {current.year}
            </h3>
            <button className="icon-btn" onClick={nextMonth}>
              <ChevronRight sx={{fontSize:20}}/>
            </button>
          </div>

          {/* Day Names */}
          <div className={styles.dayNames}>
            {DAYS.map(d => (
              <div key={d} className={styles.dayName}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className={styles.daysGrid}>
            {calendarDays.map((cell, i) => {
              const cellEvents = cell.dateStr ? getEventsForDate(cell.dateStr) : []
              const isToday = cell.dateStr === todayStr
              const isSelected = cell.dateStr === selectedDate

              return (
                <div key={i}
                  className={`
                    ${styles.dayCell}
                    ${!cell.current ? styles.dayCellOther : ''}
                    ${isToday ? styles.dayCellToday : ''}
                    ${isSelected ? styles.dayCellSelected : ''}
                    ${cell.current ? styles.dayCellActive : ''}
                  `}
                  onClick={() => cell.current && setSelectedDate(
                    isSelected ? null : cell.dateStr
                  )}>
                  <span className={styles.dayNum}>{cell.day}</span>
                  <div className={styles.cellDots}>
                    {cellEvents.slice(0, 3).map((ev, ei) => (
                      <span key={ei} className={styles.dot}
                        style={{background: eventColors[ev.type]?.color}} />
                    ))}
                    {cellEvents.length > 3 && (
                      <span className={styles.moreCount}>+{cellEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            {Object.entries(eventColors).map(([type, cfg]) => (
              <div key={type} className={styles.legendItem}>
                <span className={styles.legendDot} style={{background: cfg.color}}/>
                <span className={styles.legendLabel}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className={`card ${styles.selectedCard}`}>
              <div className={styles.selectedHeader}>
                <h4 className={styles.selectedTitle}>
                  {formatDisplayDate(selectedDate)}
                </h4>
                <span className={styles.selectedCount}>
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {selectedEvents.length === 0 ? (
                <div className={styles.noEvents}>
                  <CalendarMonth sx={{fontSize:32, color:'var(--text-muted)'}}/>
                  <p>No events on this day</p>
                </div>
              ) : (
                <div className={styles.eventList}>
                  {selectedEvents.map(ev => (
                    <div key={ev.id} className={styles.eventItem}
                      style={{
                        background: eventColors[ev.type]?.bg,
                        borderLeft: `3px solid ${eventColors[ev.type]?.color}`
                      }}>
                      <div className={styles.eventItemTop}>
                        <span className={styles.eventIcon}
                          style={{color: eventColors[ev.type]?.color}}>
                          {getTypeIcon(ev.type)}
                        </span>
                        <span className={styles.eventTitle}>{ev.title}</span>
                        {ev.time && <span className={styles.eventTime}>{ev.time}</span>}
                      </div>
                      {ev.subtitle && (
                        <p className={styles.eventSubtitle}>{ev.subtitle}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className={`card ${styles.upcomingCard}`}>
            <div className={styles.upcomingHeader}>
              <h4 className={styles.upcomingTitle}>Upcoming Events</h4>
              <span className={styles.upcomingCount}>{upcomingEvents.length}</span>
            </div>

            {loading ? (
              <p style={{padding:'16px',fontSize:'13px',color:'var(--text-muted)'}}>Loading...</p>
            ) : upcomingEvents.length === 0 ? (
              <div className={styles.noEvents}>
                <p>No upcoming events</p>
              </div>
            ) : (
              <div className={styles.upcomingList}>
                {upcomingEvents.map(ev => {
                  const evDate = new Date(ev.date + 'T00:00:00')
                  return (
                    <div key={ev.id} className={styles.upcomingItem}
                      onClick={() => setSelectedDate(ev.date)}>
                      <div className={styles.upcomingDate}>
                        <span className={styles.upcomingDay}>
                          {evDate.toLocaleDateString('en-IN', {day:'2-digit'})}
                        </span>
                        <span className={styles.upcomingMon}>
                          {evDate.toLocaleDateString('en-IN', {month:'short'})}
                        </span>
                      </div>
                      <div className={styles.upcomingInfo}>
                        <div className={styles.upcomingItemTitle}>{ev.title}</div>
                        <div className={styles.upcomingMeta}>
                          <span style={{color: eventColors[ev.type]?.color}}>
                            {getTypeIcon(ev.type)}
                          </span>
                          <span className={styles.upcomingType}>
                            {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
                          </span>
                          {ev.time && <span className={styles.upcomingTime}>{ev.time}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}