import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/auth/register', form)
      toast.success('Registered! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p>Register as a lawyer</p>
        <input placeholder="Full Name" value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} required />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} required />
        <button type="submit">Register</button>
        <p>Have account? <Link to="/login">Login here</Link></p>
      </form>
    </div>
  )
}