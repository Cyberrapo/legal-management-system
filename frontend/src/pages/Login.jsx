import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await API.post('/auth/login', form)
      login(data)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Legal Management System</h2>
        <p>Sign in to your account</p>
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} required />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} required />
        <button type="submit">Login</button>
        <p>No account? <Link to="/register">Register here</Link></p>
      </form>
    </div>
  )
}