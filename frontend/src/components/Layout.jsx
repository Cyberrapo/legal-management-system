import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, Bell, Calendar,
  MessageSquare, FileText, LogOut, Menu, X,
  Scale, Sun, Moon
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../hooks/useNotifications'
import HearingBadge from './HearingBadge'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/cases', icon: FolderOpen, label: 'Cases' },
  { to: '/hearings', icon: Bell, label: 'Hearings', badge: true },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/chat', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/documents', icon: FileText, label: 'Doc Generator' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useNotifications()

  const handleLogout = () => { logout(); navigate('/login') }
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className={styles.container}>
      <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoRow}>
          <div className={styles.logo}>
            <Scale size={20} className={styles.logoIcon} />
            <span>LegalPro</span>
          </div>
          <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.username}>{user?.name}</div>
            <div className={styles.userRole}>Advocate</div>
          </div>
        </div>

        <p className={styles.navLabel}>Navigation</p>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, end, badge }) => (
            <NavLink key={to} to={to} end={end} onClick={closeSidebar}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              <Icon size={17} className={styles.navIcon} />
              <span>{label}</span>
              {badge && <HearingBadge />}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className={styles.logout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}