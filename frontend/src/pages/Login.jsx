import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', form)
      login(data)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚖️</span>
          <h2>Welcome Back</h2>
          <p>Sign in to your legal dashboard</p>
        </div>
        <div className={styles.inputGroup}>
          <label>Email address</label>
          <input placeholder="you@example.com" type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Password</label>
          <input placeholder="Enter your password" type="password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
        </div>
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className={styles.link}>
          No account? <Link to="/register">Create one here</Link>
        </p>
      </form>
    </div>
  )
}