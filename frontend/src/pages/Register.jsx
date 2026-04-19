import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, User, Mail, Lock, ArrowLeft } from 'lucide-react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await API.post('/auth/register', form)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
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
          <h1 className={styles.heroTitle}>Start managing your practice today</h1>
          <p className={styles.heroSubtitle}>
            Join hundreds of legal professionals who trust LegalPro for their daily workflow.
          </p>
          <div className={styles.heroFeatures}>
            <div className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>📋</span>
              <span>Unlimited case tracking</span>
            </div>
            <div className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>📅</span>
              <span>Calendar & appointment management</span>
            </div>
            <div className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>📄</span>
              <span>Auto-generate legal documents</span>
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
            <h2 className={styles.formTitle}>Create account</h2>
            <p className={styles.formSubtitle}>Join as a lawyer or advocate</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrap}>
                  <input
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                  />
                  <span className={styles.inputIcon}><User size={15}/></span>
                </div>
              </div>

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
                    placeholder="Create a strong password"
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
              {loading ? 'Creating account…' : <><UserPlus size={16}/> Create Account</>}
            </button>
          </form>

          <p className={styles.link}>
            Already have an account? <Link to="/login"><ArrowLeft size={11} style={{display:'inline'}}/> Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}