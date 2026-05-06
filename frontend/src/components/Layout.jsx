import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import GavelIcon from '@mui/icons-material/Gavel'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ArticleIcon from '@mui/icons-material/Article'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import BalanceIcon from '@mui/icons-material/Balance'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import EventNoteIcon from '@mui/icons-material/EventNote'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../hooks/useNotifications'
import HearingBadge from './HearingBadge'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useNotifications()

  const handleLogout = () => { logout(); navigate('/login') }
  const closeSidebar = () => setSidebarOpen(false)

  const mainNav = [
    { to: '/', icon: <DashboardIcon sx={{ fontSize: 17 }} />, label: 'Dashboard', end: true },
    { to: '/clients', icon: <PeopleIcon sx={{ fontSize: 17 }} />, label: 'Clients' },
    { to: '/cases', icon: <FolderIcon sx={{ fontSize: 17 }} />, label: 'Cases' },
    { to: '/hearings', icon: <GavelIcon sx={{ fontSize: 17 }} />, label: 'Hearings', badge: true },
    { to: '/calendar', icon: <CalendarMonthIcon sx={{ fontSize: 17 }} />, label: 'Calendar' },
    { to: '/appointments', icon: <EventNoteIcon sx={{ fontSize: 17 }} />, label: 'Appointments' },
    { to: '/tasks', icon: <CheckBoxIcon sx={{ fontSize: 17 }} />, label: 'Tasks' },
    { to: '/analytics', icon: <BarChartIcon sx={{ fontSize: 17 }} />, label: 'Analytics' },
  ]

  const toolsNav = [
    { to: '/chat', icon: <SmartToyIcon sx={{ fontSize: 17 }} />, label: 'AI Assistant' },
    { to: '/documents', icon: <ArticleIcon sx={{ fontSize: 17 }} />, label: 'Doc Generator' },
  ]

  return (
    <div className={styles.container}>
      <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <CloseIcon sx={{ fontSize: 18 }} /> : <MenuIcon sx={{ fontSize: 18 }} />}
      </button>

      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>

        {/* LOGO */}
        <div className={styles.logoRow}>
          <div className={styles.logo}>
            <BalanceIcon sx={{ fontSize: 20 }} className={styles.logoIcon} />
            <span>LegalPro</span>
          </div>
          <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark'
              ? <LightModeIcon sx={{ fontSize: 15 }} />
              : <DarkModeIcon sx={{ fontSize: 15 }} />
            }
          </button>
        </div>

        {/* USER CARD */}
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.username}>{user?.name}</div>
            <div className={styles.userRole}>Advocate</div>
          </div>
        </div>

        {/* MAIN NAV */}
        <p className={styles.navLabel}>Main Menu</p>
        <nav className={styles.nav}>
          {mainNav.map(({ to, icon, label, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }>
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
              {badge && <HearingBadge />}
            </NavLink>
          ))}
        </nav>

        {/* TOOLS NAV */}
        <p className={styles.navLabel}>Tools</p>
        <nav className={styles.nav}>
          {toolsNav.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }>
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* SIGN OUT */}
        <div className={styles.sidebarBottom}>
          <button onClick={handleLogout} className={styles.logout}>
            <LogoutIcon sx={{ fontSize: 15 }} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}