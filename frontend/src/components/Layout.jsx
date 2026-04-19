import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useNotifications()

  const handleLogout = () => { logout(); navigate('/login') }
  const closeSidebar = () => setSidebarOpen(false)

  const mainNav = [
    { to: '/',            icon: <DashboardIcon sx={{fontSize:17}}/>,    label: t('nav_dashboard'),    end: true },
    { to: '/cases',       icon: <FolderIcon sx={{fontSize:17}}/>,       label: t('nav_cases') },
    { to: '/hearings',    icon: <GavelIcon sx={{fontSize:17}}/>,        label: t('nav_hearings'),     badge: true },
    { to: '/calendar',    icon: <CalendarMonthIcon sx={{fontSize:17}}/>,label: 'Calendar' },
    { to: '/appointments',icon: <EventNoteIcon sx={{fontSize:17}}/>,    label: t('nav_appointments') },
    { to: '/tasks',       icon: <CheckBoxIcon sx={{fontSize:17}}/>,     label: 'Tasks' },
  ]

  const toolsNav = [
    { to: '/chat',      icon: <SmartToyIcon sx={{fontSize:17}}/>, label: t('nav_ai_assistant') },
    { to: '/documents', icon: <ArticleIcon sx={{fontSize:17}}/>,  label: t('nav_doc_generator') },
  ]

  return (
    <div className={styles.container}>
      <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <CloseIcon sx={{fontSize:18}}/> : <MenuIcon sx={{fontSize:18}}/>}
      </button>

      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoRow}>
          <div className={styles.logo}>
            <BalanceIcon sx={{fontSize:20}} className={styles.logoIcon} />
            <span>LegalPro</span>
          </div>
          <button className={styles.themeBtn} onClick={toggleTheme}>
            {theme === 'dark'
              ? <LightModeIcon sx={{fontSize:15}}/>
              : <DarkModeIcon sx={{fontSize:15}}/>
            }
          </button>
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <div className={styles.username}>{user?.name}</div>
            <div className={styles.userRole}>{t('advocate')}</div>
          </div>
        </div>

        <p className={styles.navLabel}>{t('nav_main')}</p>
        <nav className={styles.nav}>
          {mainNav.map(({ to, icon, label, end, badge }) => (
            <NavLink key={to} to={to} end={end} onClick={closeSidebar}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
              {badge && <HearingBadge />}
            </NavLink>
          ))}
        </nav>

        <p className={styles.navLabel}>{t('nav_tools')}</p>
        <nav className={styles.nav}>
          {toolsNav.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={closeSidebar}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button onClick={handleLogout} className={styles.logout}>
            <LogoutIcon sx={{fontSize:15}}/>
            <span>{t('nav_signout')}</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}