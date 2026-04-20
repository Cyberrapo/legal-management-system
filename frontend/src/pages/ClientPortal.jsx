import { useState, useEffect } from 'react'
import {
    FolderOpen, CalendarMonth, Person, Logout,
    Gavel, Description, ExpandMore, ExpandLess,
    Download, Visibility, BalanceOutlined
} from '@mui/icons-material'
import axios from 'axios'
import styles from './ClientPortal.module.css'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const API = axios.create({ baseURL: BASE })
API.interceptors.request.use(req => {
    const client = JSON.parse(localStorage.getItem('clientUser') || 'null')
    if (client?.token) req.headers.Authorization = `Bearer ${client.token}`
    return req
})

const statusBadge = {
    Open: { bg: 'rgba(108,99,255,0.15)', color: '#8b85ff' },
    'In Progress': { bg: 'rgba(79,172,254,0.15)', color: '#4facfe' },
    Closed: { bg: 'rgba(67,233,123,0.15)', color: '#43e97b' },
}

export default function ClientPortal() {
    const [screen, setScreen] = useState('login')
    const [client, setClient] = useState(() =>
        JSON.parse(localStorage.getItem('clientUser') || 'null')
    )
    const [cases, setCases] = useState([])
    const [appointments, setAppts] = useState([])
    const [lawyer, setLawyer] = useState(null)
    const [activeTab, setActiveTab] = useState('cases')
    const [expandedCase, setExpanded] = useState(null)
    const [viewingDoc, setViewingDoc] = useState(null)

    const [form, setForm] = useState({ email: '', password: '' })
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (client) { setScreen('portal'); fetchData() }
    }, [client])

    const fetchData = async () => {
        try {
            const [cRes, aRes, lRes] = await Promise.all([
                API.get('/clients/portal/cases'),
                API.get('/clients/portal/appointments'),
                API.get('/clients/portal/lawyer'),
            ])
            setCases(cRes.data)
            setAppts(aRes.data)
            setLawyer(lRes.data)
        } catch (e) { console.error(e) }
    }

    const handleLogin = async (e) => {
        e.preventDefault(); setErr(''); setLoading(true)
        try {
            const { data } = await API.post('/clients/login', form)
            localStorage.setItem('clientUser', JSON.stringify(data))
            setClient(data); setScreen('portal')
        } catch (e) {
            setErr(e.response?.data?.message || 'Invalid credentials')
        }
        setLoading(false)
    }

    const handleLogout = () => {
        localStorage.removeItem('clientUser')
        setClient(null); setScreen('login')
        setCases([]); setAppts([]); setLawyer(null)
    }

    const getDaysUntil = (date) => {
        const diff = Math.ceil((new Date(date) - new Date()) / 86400000)
        if (diff === 0) return 'Today'
        if (diff === 1) return 'Tomorrow'
        if (diff < 0) return `${Math.abs(diff)}d ago`
        return `In ${diff} days`
    }

    // ── LOGIN SCREEN ──
    if (screen === 'login') return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.loginBrand}>
                    <div className={styles.loginIcon}>
                        <BalanceOutlined sx={{ fontSize: 28, color: '#6c63ff' }} />
                    </div>
                    <h1 className={styles.loginTitle}>Client Portal</h1>
                    <p className={styles.loginSub}>Sign in to view your case status and documents</p>
                </div>

                {err && <div className={styles.errBox}>{err}</div>}

                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Email Address</label>
                        <input className={styles.input} type="email" placeholder="your@email.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Password</label>
                        <input className={styles.input} type="password" placeholder="Enter your password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className={styles.loginBtn} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className={styles.loginNote}>
                    Your login credentials were provided by your advocate.
                    Contact them if you need access.
                </p>
            </div>
        </div>
    )

    // ── PORTAL SCREEN ──
    const openCases = cases.filter(c => c.status === 'Open').length
    const upcomingAppts = appointments.filter(a =>
        new Date(a.date) >= new Date() && a.status === 'Scheduled'
    ).length

    return (
        <div className={styles.portal}>

            {/* TOPBAR */}
            <div className={styles.topbar}>
                <div className={styles.topbarLeft}>
                    <div className={styles.topbarIcon}>
                        <BalanceOutlined sx={{ fontSize: 20, color: '#6c63ff' }} />
                    </div>
                    <div>
                        <div className={styles.topbarTitle}>LegalPro Client Portal</div>
                        <div className={styles.topbarSub}>Read-only access to your legal matters</div>
                    </div>
                </div>
                <div className={styles.topbarRight}>
                    <div className={styles.clientChip}>
                        <div className={styles.clientChipAvatar}>
                            {client?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.clientChipName}>{client?.name}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <Logout sx={{ fontSize: 15 }} /> Sign Out
                    </button>
                </div>
            </div>

            <div className={styles.portalBody}>

                {/* SIDEBAR */}
                <aside className={styles.portalSidebar}>

                    {/* Lawyer Card */}
                    {lawyer && (
                        <div className={styles.lawyerCard}>
                            <div className={styles.lawyerAvatar}>
                                {lawyer.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.lawyerInfo}>
                                <div className={styles.lawyerLabel}>Your Advocate</div>
                                <div className={styles.lawyerName}>{lawyer.name}</div>
                                <div className={styles.lawyerEmail}>{lawyer.email}</div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className={styles.sideStats}>
                        <div className={styles.sideStat}>
                            <FolderOpen sx={{ fontSize: 18, color: '#6c63ff' }} />
                            <div>
                                <div className={styles.sideStatVal}>{cases.length}</div>
                                <div className={styles.sideStatLabel}>Total Cases</div>
                            </div>
                        </div>
                        <div className={styles.sideStat}>
                            <Gavel sx={{ fontSize: 18, color: '#ff6b6b' }} />
                            <div>
                                <div className={styles.sideStatVal}>{openCases}</div>
                                <div className={styles.sideStatLabel}>Open Cases</div>
                            </div>
                        </div>
                        <div className={styles.sideStat}>
                            <CalendarMonth sx={{ fontSize: 18, color: '#4facfe' }} />
                            <div>
                                <div className={styles.sideStatVal}>{upcomingAppts}</div>
                                <div className={styles.sideStatLabel}>Upcoming Appointments</div>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className={styles.sideNav}>
                        <button
                            className={`${styles.sideNavBtn} ${activeTab === 'cases' ? styles.sideNavActive : ''}`}
                            onClick={() => setActiveTab('cases')}>
                            <FolderOpen sx={{ fontSize: 16 }} /> My Cases
                        </button>
                        <button
                            className={`${styles.sideNavBtn} ${activeTab === 'appointments' ? styles.sideNavActive : ''}`}
                            onClick={() => setActiveTab('appointments')}>
                            <CalendarMonth sx={{ fontSize: 16 }} /> My Appointments
                        </button>
                    </nav>
                </aside>

                {/* MAIN */}
                <main className={styles.portalMain}>

                    {/* CASES TAB */}
                    {activeTab === 'cases' && (
                        <div className="animate-fade">
                            <div className={styles.tabHeader}>
                                <h2 className={styles.tabTitle}>My Cases</h2>
                                <span className={styles.tabCount}>{cases.length} case{cases.length !== 1 ? 's' : ''}</span>
                            </div>

                            {cases.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <FolderOpen sx={{ fontSize: 52, color: 'var(--text-muted)' }} />
                                    <p className={styles.emptyTitle}>No cases yet</p>
                                    <p className={styles.emptySubtitle}>Your advocate has not linked any cases to your account yet.</p>
                                </div>
                            ) : cases.map(c => (
                                <div key={c._id} className={styles.caseCard}>
                                    <div className={styles.caseCardTop}>
                                        <div className={styles.caseCardLeft}>
                                            <span className={styles.caseBadge}
                                                style={{
                                                    background: statusBadge[c.status]?.bg,
                                                    color: statusBadge[c.status]?.color,
                                                    border: `1px solid ${statusBadge[c.status]?.color}33`
                                                }}>
                                                {c.status}
                                            </span>
                                            <h3 className={styles.caseCardTitle}>{c.title}</h3>
                                            <div className={styles.caseCardMeta}>
                                                <span className={styles.caseMetaItem}>
                                                    <Gavel sx={{ fontSize: 12 }} /> {c.caseType}
                                                </span>
                                                <span className={styles.caseMetaItem}>
                                                    <CalendarMonth sx={{ fontSize: 12 }} />
                                                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                                </span>
                                                {c.hearingDate && (
                                                    <span className={styles.hearingPill}>
                                                        Next Hearing: {new Date(c.hearingDate).toLocaleDateString('en-IN')}
                                                        {c.hearingTime && ` @ ${c.hearingTime}`}
                                                        <span className={styles.hearingDue}>
                                                            {getDaysUntil(c.hearingDate)}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className={styles.expandBtn}
                                            onClick={() => setExpanded(expandedCase === c._id ? null : c._id)}>
                                            {expandedCase === c._id
                                                ? <ExpandLess sx={{ fontSize: 20 }} />
                                                : <ExpandMore sx={{ fontSize: 20 }} />
                                            }
                                        </button>
                                    </div>

                                    {expandedCase === c._id && (
                                        <div className={styles.caseExpanded}>
                                            {c.description && (
                                                <div className={styles.caseDesc}>
                                                    <p className={styles.caseDescLabel}>Case Description</p>
                                                    <p className={styles.caseDescText}>{c.description}</p>
                                                </div>
                                            )}

                                            {c.hearingNotes && (
                                                <div className={styles.hearingNotesBox}>
                                                    <p className={styles.caseDescLabel}>Hearing Notes</p>
                                                    <p className={styles.caseDescText}>{c.hearingNotes}</p>
                                                </div>
                                            )}

                                            {/* Timeline */}
                                            {c.timeline?.length > 0 && (
                                                <div className={styles.timelineSection}>
                                                    <p className={styles.caseDescLabel}>Case Timeline</p>
                                                    <div className={styles.timeline}>
                                                        {[...c.timeline].reverse().map((t, i) => (
                                                            <div key={i} className={styles.tlItem}>
                                                                <div className={styles.tlDot} />
                                                                <div className={styles.tlContent}>
                                                                    <span className={styles.tlAction}>{t.action}</span>
                                                                    {t.description && (
                                                                        <span className={styles.tlDesc}>{t.description}</span>
                                                                    )}
                                                                    <span className={styles.tlTime}>
                                                                        {new Date(t.timestamp).toLocaleDateString('en-IN', {
                                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                                            hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Documents */}
                                            {c.documents?.length > 0 && (
                                                <div className={styles.docsSection}>
                                                    <p className={styles.caseDescLabel}>
                                                        <Description sx={{ fontSize: 13 }} /> Documents ({c.documents.length})
                                                    </p>
                                                    <div className={styles.docsList}>
                                                        {c.documents.map(doc => (
                                                            <div key={doc._id} className={styles.docItem}>
                                                                <Description sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
                                                                <span className={styles.docName}>{doc.name}</span>
                                                                <div className={styles.docActions}>
                                                                    <button className="icon-btn info"
                                                                        title="View" onClick={() => setViewingDoc(doc)}>
                                                                        <Visibility sx={{ fontSize: 13 }} />
                                                                    </button>
                                                                    <a href={doc.url} download target="_blank"
                                                                        rel="noreferrer" className="icon-btn success" title="Download">
                                                                        <Download sx={{ fontSize: 13 }} />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {activeTab === 'appointments' && (
                        <div className="animate-fade">
                            <div className={styles.tabHeader}>
                                <h2 className={styles.tabTitle}>My Appointments</h2>
                                <span className={styles.tabCount}>{appointments.length}</span>
                            </div>

                            {appointments.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <CalendarMonth sx={{ fontSize: 52, color: 'var(--text-muted)' }} />
                                    <p className={styles.emptyTitle}>No appointments</p>
                                    <p className={styles.emptySubtitle}>Your advocate has not scheduled any appointments yet.</p>
                                </div>
                            ) : appointments.map(a => (
                                <div key={a._id} className={styles.apptCard}>
                                    <div className={styles.apptDate}>
                                        <span className={styles.apptDay}>
                                            {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit' })}
                                        </span>
                                        <span className={styles.apptMon}>
                                            {new Date(a.date).toLocaleDateString('en-IN', { month: 'short' })}
                                        </span>
                                        <span className={styles.apptYear}>
                                            {new Date(a.date).getFullYear()}
                                        </span>
                                    </div>
                                    <div className={styles.apptInfo}>
                                        <h3 className={styles.apptTitle}>{a.title}</h3>
                                        <div className={styles.apptMeta}>
                                            {a.time && <span className={styles.apptTime}>{a.time}</span>}
                                            <span className={`${styles.apptStatus} ${a.status === 'Scheduled' ? styles.apptScheduled
                                                    : a.status === 'Completed' ? styles.apptCompleted
                                                        : styles.apptCancelled
                                                }`}>{a.status}</span>
                                        </div>
                                        {a.notes && <p className={styles.apptNotes}>{a.notes}</p>}
                                        <p className={styles.apptDue}>{getDaysUntil(a.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* DOCUMENT VIEWER */}
            {viewingDoc && (
                <div className={styles.modal} onClick={() => setViewingDoc(null)}>
                    <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalTop}>
                            <span className={styles.modalDocName}>{viewingDoc.name}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <a href={viewingDoc.url} download target="_blank"
                                    rel="noreferrer" className="icon-btn success">
                                    <Download sx={{ fontSize: 14 }} />
                                </a>
                                <button className="icon-btn danger" onClick={() => setViewingDoc(null)}>
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className={styles.modalBody}>
                            {viewingDoc.name?.endsWith('.pdf') || viewingDoc.fileType === 'application/pdf' ? (
                                <iframe src={viewingDoc.url} title={viewingDoc.name} className={styles.pdfFrame} />
                            ) : viewingDoc.fileType?.startsWith('image/') ||
                                viewingDoc.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img src={viewingDoc.url} alt={viewingDoc.name} className={styles.imgPreview} />
                            ) : (
                                <div className={styles.unsupported}>
                                    <p>Preview not available</p>
                                    <a href={viewingDoc.url} target="_blank" rel="noreferrer" className="btn-primary">
                                        <Download sx={{ fontSize: 14 }} /> Open File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}