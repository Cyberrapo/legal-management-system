import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>LegalApp</div>
        <p className={styles.username}>{user?.name}</p>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink>
          <NavLink to="/cases" className={({ isActive }) => isActive ? styles.active : ''}>Cases</NavLink>
          <NavLink to="/appointments" className={({ isActive }) => isActive ? styles.active : ''}>Appointments</NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? styles.active : ''}>AI Chatbot</NavLink>
        </nav>
        <button onClick={handleLogout} className={styles.logout}>Logout</button>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}