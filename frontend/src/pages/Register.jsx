import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/auth/register', form)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚖️</span>
          <h2>Create Account</h2>
          <p>Join as a lawyer or advocate</p>
        </div>
        <div className={styles.inputGroup}>
          <label>Full Name</label>
          <input placeholder="Your full name" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Email address</label>
          <input placeholder="you@example.com" type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className={styles.inputGroup}>
          <label>Password</label>
          <input placeholder="Create a password" type="password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
        </div>
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className={styles.link}>
          Have an account? <Link to="/login">Sign in here</Link>
        </p>
      </form>
    </div>
  )
}