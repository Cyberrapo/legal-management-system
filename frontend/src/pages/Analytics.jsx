import { useEffect, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import FolderIcon from '@mui/icons-material/Folder'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GavelIcon from '@mui/icons-material/Gavel'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import API from '../api/axios'
import styles from './Analytics.module.css'

const COLORS = {
    primary: '#6c63ff',
    accent: '#4facfe',
    success: '#43e97b',
    warning: '#f6d365',
    danger: '#ff6b6b',
    purple: '#a78bfa',
    teal: '#2dd4bf',
    pink: '#f472b6',
}

const PIE_COLORS = [
    COLORS.primary, COLORS.accent, COLORS.success,
    COLORS.warning, COLORS.danger, COLORS.purple
]

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p, i) => (
                <p key={i} className={styles.tooltipItem} style={{ color: p.color || p.fill }}>
                    {p.name}: <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    )
}

const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipLabel}>{payload[0].name}</p>
            <p className={styles.tooltipItem} style={{ color: payload[0].payload.fill }}>
                Count: <strong>{payload[0].value}</strong>
            </p>
            <p className={styles.tooltipItem} style={{ color: payload[0].payload.fill }}>
                Share: <strong>{payload[0].payload.percent}%</strong>
            </p>
        </div>
    )
}

export default function Analytics() {
    const [cases, setCases] = useState([])
    const [appointments, setAppts] = useState([])
    const [tasks, setTasks] = useState([])
    const [hearings, setHearings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [cRes, aRes, tRes, hRes] = await Promise.all([
                    API.get('/cases'),
                    API.get('/appointments'),
                    API.get('/tasks'),
                    API.get('/cases/hearings/upcoming'),
                ])
                setCases(cRes.data)
                setAppts(aRes.data)
                setTasks(tRes.data)
                setHearings(hRes.data)
            } catch (err) {
                console.error(err)
            }
            setLoading(false)
        }
        fetchAll()
    }, [])

    if (loading) {
        return (
            <div className={styles.loadingWrap}>
                <div className={styles.spinner} />
                <p>Loading analytics...</p>
            </div>
        )
    }

    // ── COMPUTED STATS ──────────────────────────────────────────────
    const totalCases = cases.length
    const openCases = cases.filter(c => c.status === 'Open').length
    const inProgressCases = cases.filter(c => c.status === 'In Progress').length
    const closedCases = cases.filter(c => c.status === 'Closed').length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'Completed').length
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length
    const overdueTasks = tasks.filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false
        return new Date(t.dueDate) < new Date()
    }).length
    const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100) : 0
    const totalAppts = appointments.length
    const scheduledAppts = appointments.filter(a => a.status === 'Scheduled').length

    // ── CASE TYPE PIE ───────────────────────────────────────────────
    const caseTypeMap = {}
    cases.forEach(c => {
        caseTypeMap[c.caseType] = (caseTypeMap[c.caseType] || 0) + 1
    })
    const caseTypePie = Object.entries(caseTypeMap).map(([name, value]) => ({
        name, value,
        percent: totalCases > 0 ? Math.round((value / totalCases) * 100) : 0
    }))

    // ── CASE STATUS BAR ─────────────────────────────────────────────
    const caseStatusData = [
        { name: 'Open', value: openCases, fill: COLORS.primary },
        { name: 'In Progress', value: inProgressCases, fill: COLORS.accent },
        { name: 'Closed', value: closedCases, fill: COLORS.success },
    ]

    // ── MONTHLY CASES LINE ──────────────────────────────────────────
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyCasesMap = {}
    cases.forEach(c => {
        const d = new Date(c.createdAt)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        monthlyCasesMap[key] = (monthlyCasesMap[key] || 0) + 1
    })
    const now = new Date()
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        return {
            month: monthNames[d.getMonth()],
            cases: monthlyCasesMap[key] || 0,
        }
    })

    // ── MONTHLY APPOINTMENTS LINE ───────────────────────────────────
    const monthlyApptMap = {}
    appointments.forEach(a => {
        const d = new Date(a.createdAt)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        monthlyApptMap[key] = (monthlyApptMap[key] || 0) + 1
    })
    const monthlyApptData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        return {
            month: monthNames[d.getMonth()],
            appointments: monthlyApptMap[key] || 0,
        }
    })

    // ── TASK PRIORITY BAR ───────────────────────────────────────────
    const taskPriorityData = [
        { name: 'High', value: tasks.filter(t => t.priority === 'High').length, fill: COLORS.danger },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, fill: COLORS.warning },
        { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, fill: COLORS.success },
    ]

    // ── COMBINED MONTHLY AREA ───────────────────────────────────────
    const combinedMonthly = monthlyData.map((m, i) => ({
        month: m.month,
        cases: m.cases,
        appointments: monthlyApptData[i]?.appointments || 0,
    }))

    // ── APPOINTMENT STATUS PIE ──────────────────────────────────────
    const apptStatusMap = {}
    appointments.forEach(a => {
        apptStatusMap[a.status] = (apptStatusMap[a.status] || 0) + 1
    })
    const apptStatusPie = Object.entries(apptStatusMap).map(([name, value]) => ({
        name, value,
        percent: totalAppts > 0 ? Math.round((value / totalAppts) * 100) : 0
    }))

    const statCards = [
        {
            label: 'Total Cases',
            value: totalCases,
            sub: `${openCases} open · ${closedCases} closed`,
            icon: <FolderIcon sx={{ fontSize: 22 }} />,
            color: styles.cardBlue,
            iconColor: COLORS.primary,
            trend: openCases > closedCases ? 'up' : 'down',
        },
        {
            label: 'Task Completion',
            value: `${completionRate}%`,
            sub: `${completedTasks} of ${totalTasks} tasks done`,
            icon: <CheckCircleIcon sx={{ fontSize: 22 }} />,
            color: styles.cardGreen,
            iconColor: COLORS.success,
            trend: completionRate >= 50 ? 'up' : 'down',
        },
        {
            label: 'Appointments',
            value: totalAppts,
            sub: `${scheduledAppts} scheduled`,
            icon: <CalendarMonthIcon sx={{ fontSize: 22 }} />,
            color: styles.cardTeal,
            iconColor: COLORS.teal,
            trend: 'up',
        },
        {
            label: 'Upcoming Hearings',
            value: hearings.length,
            sub: 'in the next 7 days',
            icon: <GavelIcon sx={{ fontSize: 22 }} />,
            color: styles.cardAmber,
            iconColor: COLORS.warning,
            trend: hearings.length > 0 ? 'up' : 'down',
        },
        {
            label: 'Overdue Tasks',
            value: overdueTasks,
            sub: `${pendingTasks} still pending`,
            icon: <AccessTimeIcon sx={{ fontSize: 22 }} />,
            color: styles.cardRed,
            iconColor: COLORS.danger,
            trend: overdueTasks > 0 ? 'down' : 'up',
        },
        {
            label: 'Active Tasks',
            value: tasks.filter(t => t.status === 'In Progress').length,
            sub: 'currently in progress',
            icon: <AssignmentIcon sx={{ fontSize: 22 }} />,
            color: styles.cardPurple,
            iconColor: COLORS.purple,
            trend: 'up',
        },
    ]

    const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 5) return null
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)
        return (
            <text x={x} y={y} fill="white" textAnchor="middle"
                dominantBaseline="central" fontSize={11} fontWeight={700}>
                {`${Math.round(percent)}%`}
            </text>
        )
    }

    return (
        <div className="animate-fade">

            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Analytics</h2>
                    <p className="page-subtitle">Overview of your legal practice performance</p>
                </div>
                <div className={styles.headerBadge}>
                    <TrendingUpIcon sx={{ fontSize: 15 }} />
                    Live Data
                </div>
            </div>

            {/* STAT CARDS */}
            <div className={styles.statGrid}>
                {statCards.map((s, i) => (
                    <div key={i} className={`${styles.statCard} ${s.color}`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrap} style={{ color: s.iconColor }}>
                                {s.icon}
                            </div>
                            <div className={styles.statTrend}>
                                {s.trend === 'up'
                                    ? <TrendingUpIcon sx={{ fontSize: 16, color: COLORS.success }} />
                                    : <TrendingDownIcon sx={{ fontSize: 16, color: COLORS.danger }} />
                                }
                            </div>
                        </div>
                        <div className={styles.statVal}>{s.value}</div>
                        <div className={styles.statLabel}>{s.label}</div>
                        <div className={styles.statSub}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* ROW 1 — Area Chart + Case Type Pie */}
            <div className={styles.row2}>

                {/* COMBINED MONTHLY AREA CHART */}
                <div className={`card ${styles.chartCard}`}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>Monthly Activity</h3>
                            <p className={styles.chartSub}>Cases and appointments over last 6 months</p>
                        </div>
                    </div>
                    <div className={styles.chartWrap}>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={combinedMonthly}
                                margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradCases" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradAppts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                <Area type="monotone" dataKey="cases" name="Cases"
                                    stroke={COLORS.primary} strokeWidth={2.5}
                                    fill="url(#gradCases)" dot={{ fill: COLORS.primary, r: 3 }} />
                                <Area type="monotone" dataKey="appointments" name="Appointments"
                                    stroke={COLORS.accent} strokeWidth={2.5}
                                    fill="url(#gradAppts)" dot={{ fill: COLORS.accent, r: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CASE TYPE PIE */}
                <div className={`card ${styles.chartCard}`}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>Case Types</h3>
                            <p className={styles.chartSub}>Distribution by category</p>
                        </div>
                    </div>
                    {caseTypePie.length === 0 ? (
                        <div className={styles.noData}>No case data available</div>
                    ) : (
                        <>
                            <div className={styles.chartWrap}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={caseTypePie}
                                            cx="50%" cy="50%"
                                            outerRadius={85} innerRadius={40}
                                            dataKey="value"
                                            labelLine={false}
                                            label={renderCustomPieLabel}>
                                            {caseTypePie.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className={styles.pieLegend}>
                                {caseTypePie.map((item, i) => (
                                    <div key={i} className={styles.pieLegendItem}>
                                        <span className={styles.pieDot}
                                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className={styles.pieLegendLabel}>{item.name}</span>
                                        <span className={styles.pieLegendVal}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ROW 2 — Case Status Bar + Task Priority Bar + Appt Pie */}
            <div className={styles.row3}>

                {/* CASE STATUS BAR */}
                <div className={`card ${styles.chartCard}`}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>Case Status</h3>
                            <p className={styles.chartSub}>Breakdown by current status</p>
                        </div>
                    </div>
                    <div className={styles.chartWrap}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={caseStatusData}
                                margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
                                barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Cases" radius={[6, 6, 0, 0]}>
                                    {caseStatusData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TASK PRIORITY BAR */}
                <div className={`card ${styles.chartCard}`}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>Task Priority</h3>
                            <p className={styles.chartSub}>Tasks grouped by priority level</p>
                        </div>
                    </div>
                    <div className={styles.chartWrap}>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={taskPriorityData}
                                margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
                                barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                    axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                                    {taskPriorityData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* APPOINTMENT STATUS PIE */}
                <div className={`card ${styles.chartCard}`}>
                    <div className={styles.chartHeader}>
                        <div>
                            <h3 className={styles.chartTitle}>Appointment Status</h3>
                            <p className={styles.chartSub}>Scheduled vs completed</p>
                        </div>
                    </div>
                    {apptStatusPie.length === 0 ? (
                        <div className={styles.noData}>No appointment data</div>
                    ) : (
                        <>
                            <div className={styles.chartWrap}>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie data={apptStatusPie} cx="50%" cy="50%"
                                            outerRadius={70} innerRadius={30}
                                            dataKey="value" labelLine={false}
                                            label={renderCustomPieLabel}>
                                            {apptStatusPie.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className={styles.pieLegend}>
                                {apptStatusPie.map((item, i) => (
                                    <div key={i} className={styles.pieLegendItem}>
                                        <span className={styles.pieDot}
                                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className={styles.pieLegendLabel}>{item.name}</span>
                                        <span className={styles.pieLegendVal}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ROW 3 — SUMMARY TABLE */}
            <div className={`card ${styles.summaryCard}`}>
                <div className={styles.chartHeader}>
                    <div>
                        <h3 className={styles.chartTitle}>Practice Summary</h3>
                        <p className={styles.chartSub}>Key metrics at a glance</p>
                    </div>
                </div>
                <div className={styles.summaryGrid}>
                    {[
                        { label: 'Total Cases', value: totalCases, color: COLORS.primary },
                        { label: 'Open Cases', value: openCases, color: COLORS.accent },
                        { label: 'Cases In Progress', value: inProgressCases, color: COLORS.warning },
                        { label: 'Closed Cases', value: closedCases, color: COLORS.success },
                        { label: 'Total Tasks', value: totalTasks, color: COLORS.purple },
                        { label: 'Completed Tasks', value: completedTasks, color: COLORS.success },
                        { label: 'Overdue Tasks', value: overdueTasks, color: COLORS.danger },
                        { label: 'Task Completion Rate', value: `${completionRate}%`, color: COLORS.teal },
                        { label: 'Total Appointments', value: totalAppts, color: COLORS.primary },
                        { label: 'Scheduled Appts', value: scheduledAppts, color: COLORS.accent },
                        { label: 'Upcoming Hearings', value: hearings.length, color: COLORS.warning },
                        { label: 'Civil Cases', value: caseTypeMap['Civil'] || 0, color: COLORS.purple },
                    ].map((item, i) => (
                        <div key={i} className={styles.summaryItem}>
                            <div className={styles.summaryBar}
                                style={{ background: item.color + '22', borderLeft: `3px solid ${item.color}` }}>
                                <span className={styles.summaryLabel}>{item.label}</span>
                                <span className={styles.summaryVal} style={{ color: item.color }}>
                                    {item.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}