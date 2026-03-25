import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className={styles.container}>
      <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div className={sidebarOpen ? styles.overlayVisible : styles.overlay}
        onClick={closeSidebar} />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>⚖️ LegalApp</div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.username}>{user?.name}</div>
            <div className={styles.userRole}>Advocate</div>
          </div>
        </div>

        <span className={styles.navLabel}>Main Menu</span>

        <nav className={styles.nav}>
          <NavLink to="/" end onClick={closeSidebar}
            className={({ isActive }) => isActive ? styles.active : ''}>
            <span className={styles.navIcon}>📊</span> Dashboard
          </NavLink>
          <NavLink to="/cases" onClick={closeSidebar}
            className={({ isActive }) => isActive ? styles.active : ''}>
            <span className={styles.navIcon}>📁</span> Cases
          </NavLink>
          <NavLink to="/appointments" onClick={closeSidebar}
            className={({ isActive }) => isActive ? styles.active : ''}>
            <span className={styles.navIcon}>📅</span> Appointments
          </NavLink>
          <NavLink to="/chat" onClick={closeSidebar}
            className={({ isActive }) => isActive ? styles.active : ''}>
            <span className={styles.navIcon}>🤖</span> AI Assistant
          </NavLink>
        </nav>

        <button onClick={handleLogout} className={styles.logout}>
          <span className={styles.navIcon}>🚪</span> Logout
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}