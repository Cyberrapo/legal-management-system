import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react'
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
      {/* ── HERO PANEL ── */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrid} />
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>⚖️</div>
          <h1 className={styles.heroTitle}>Legal practice, beautifully managed</h1>
          <p className={styles.heroSubtitle}>
            Track cases, hearings, appointments, and documents — all in one intelligent workspace.
          </p>
          <div className={styles.heroFeatures}>
            <div className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>📁</span>
              <span>Smart case & document management</span>
            </div>
            <div className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>🔔</span>
              <span>Automated hearing reminders</span>
            </div>
            <div className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>🤖</span>
              <span>AI-powered legal assistant</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORM PANEL ── */}
      <div className={styles.formPanel}>
        <div className={styles.form}>
          <div className={styles.formTop}>
            <div className={styles.formBrand}>
              <div className={styles.formBrandIcon}>⚖️</div>
              <span className={styles.formBrandName}>LegalPro</span>
            </div>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your legal dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <div className={styles.inputGroup}>
                <label>Email address</label>
                <div className={styles.inputWrap}>
                  <input
                    placeholder="you@lawfirm.com"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    required
                  />
                  <span className={styles.inputIcon}><Mail size={15}/></span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrap}>
                  <input
                    placeholder="Enter your password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required
                  />
                  <span className={styles.inputIcon}><Lock size={15}/></span>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Signing in…' : <><LogIn size={16}/> Sign In</>}
            </button>
          </form>

          <p className={styles.link}>
            No account? <Link to="/register">Create one here <ArrowRight size={11} style={{display:'inline'}}/></Link>
          </p>
        </div>
      </div>
    </div>
  )
}