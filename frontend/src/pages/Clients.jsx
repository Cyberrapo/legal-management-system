import { useEffect, useState } from 'react'
import {
  Add, Close, Edit, Delete, Person, Search,
  Email, Phone, Home, LinkOutlined,
  Visibility, VisibilityOff, FilterList, Clear
} from '@mui/icons-material'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Clients.module.css'

const empty = { name: '', email: '', phone: '', address: '', notes: '' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [cases, setCases] = useState([])
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [linkModal, setLinkModal] = useState(null)
  const [selectedCase, setSelectedCase] = useState('')

  // Search & Filter
  const [search, setSearch] = useState('')
  const [filterCase, setFilterCase] = useState('All')

  const fetchClients = async () => {
    try {
      const { data } = await API.get('/clients')
      setClients(data)
    } catch { toast.error('Failed to load clients') }
  }

  const fetchCases = async () => {
    try {
      const { data } = await API.get('/cases')
      setCases(data)
    } catch { }
  }

  useEffect(() => { fetchClients(); fetchCases() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.phone && form.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }
    setLoading(true)
    try {
      if (editId) {
        await API.put(`/clients/${editId}`, form)
        toast.success('Client updated!')
      } else {
        await API.post('/clients', form)
        toast.success('Client added!')
      }
      setForm(empty); setShowForm(false); setEditId(null)
      fetchClients()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this client?')) return
    await API.delete(`/clients/${id}`)
    toast.success('Client removed')
    fetchClients()
  }

  const handleEdit = (c) => {
    setForm({
      name: c.name, email: c.email || '',
      phone: c.phone || '', address: c.address || '',
      notes: c.notes || ''
    })
    setEditId(c._id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLinkCase = async () => {
    if (!selectedCase) return toast.error('Select a case to link')
    try {
      await API.post(`/clients/link-case/${selectedCase}`, { clientId: linkModal._id })
      toast.success(`Case linked to ${linkModal.name}!`)
      setLinkModal(null); setSelectedCase('')
      fetchCases()
    } catch { toast.error('Failed to link case') }
  }

  const handleUnlinkCase = async (caseId) => {
    try {
      await API.post(`/clients/link-case/${caseId}`, { clientId: null })
      toast.success('Case unlinked')
      fetchCases()
    } catch { toast.error('Failed to unlink') }
  }

  const resetForm = () => {
    setShowForm(false); setEditId(null); setForm(empty)
  }

  const getClientCases = (clientId) =>
    cases.filter(c => String(c.clientId) === String(clientId))

  // ── FILTERED LIST ──
  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchSearch =
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    const clientCases = getClientCases(c._id)
    const matchCase =
      filterCase === 'All' ||
      (filterCase === 'Linked' && clientCases.length > 0) ||
      (filterCase === 'Unlinked' && clientCases.length === 0)
    return matchSearch && matchCase
  })

  const clearFilters = () => { setSearch(''); setFilterCase('All') }
  const hasFilters = search || filterCase !== 'All'

  return (
    <div className="animate-fade">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Clients</h2>
          <p className="page-subtitle">
            {clients.length} client{clients.length !== 1 ? 's' : ''} · {filtered.length} shown
          </p>
        </div>
        <button className="btn-primary"
          onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm
            ? <><Close sx={{ fontSize: 15 }} /> Cancel</>
            : <><Add sx={{ fontSize: 15 }} /> Add Client</>
          }
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <Search sx={{ fontSize: 16, color: 'var(--text-muted)' }} />
          <input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>
              <Close sx={{ fontSize: 14 }} />
            </button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <FilterList sx={{ fontSize: 15, color: 'var(--text-muted)' }} />
          {['All', 'Linked', 'Unlinked'].map(f => (
            <button key={f}
              className={`${styles.filterBtn} ${filterCase === f ? styles.filterActive : ''}`}
              onClick={() => setFilterCase(f)}>
              {f}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button className={styles.clearFilters} onClick={clearFilters}>
            <Clear sx={{ fontSize: 14 }} /> Clear
          </button>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className={`card ${styles.formCard} animate-scale`}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>
              {editId ? 'Edit Client' : 'New Client'}
            </h3>
            <button className="icon-btn" onClick={resetForm}>
              <Close sx={{ fontSize: 16 }} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label className="form-label">Full Name *</label>
                <input className="input" placeholder="Client full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input className="input" type="email" placeholder="client@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  className="input"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setForm({ ...form, phone: val })
                  }}
                />
                {form.phone && form.phone.length > 0 && form.phone.length < 10 && (
                  <p style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px' }}>
                    Phone number must be exactly 10 digits
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Address</label>
                <input className="input" placeholder="City, State"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-full">
                <label className="form-label">Notes</label>
                <textarea className="input" style={{ height: '68px', resize: 'vertical' }}
                  placeholder="Any additional notes about this client..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editId ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLIENT GRID */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Person sx={{ fontSize: 52, color: 'var(--text-muted)' }} className="empty-icon" />
          <p className="empty-title">
            {hasFilters ? 'No clients match your search' : 'No clients yet'}
          </p>
          <p className="empty-subtitle">
            {hasFilters ? 'Try clearing filters' : 'Click Add Client to get started'}
          </p>
          {hasFilters && (
            <button className="btn-ghost" style={{ marginTop: 8 }} onClick={clearFilters}>
              <Clear sx={{ fontSize: 14 }} /> Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.clientGrid}>
          {filtered.map(client => {
            const clientCases = getClientCases(client._id)
            return (
              <div key={client._id} className={`card ${styles.clientCard} animate-fade`}>

                {/* TOP */}
                <div className={styles.clientTop}>
                  <div className={styles.clientAvatar}>
                    {client.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.clientActions}>
                    <button className="icon-btn info" title="Link Case"
                      onClick={() => { setLinkModal(client); setSelectedCase('') }}>
                      <LinkOutlined sx={{ fontSize: 15 }} />
                    </button>
                    <button className="icon-btn" title="Edit"
                      onClick={() => handleEdit(client)}>
                      <Edit sx={{ fontSize: 14 }} />
                    </button>
                    <button className="icon-btn danger" title="Remove"
                      onClick={() => handleDelete(client._id)}>
                      <Delete sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                </div>

                <h3 className={styles.clientName}>{client.name}</h3>

                {/* CONTACT INFO */}
                <div className={styles.clientInfo}>
                  {client.email && (
                    <div className={styles.infoRow}>
                      <Email sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className={styles.infoRow}>
                      <Phone sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className={styles.infoRow}>
                      <Home sx={{ fontSize: 13, color: 'var(--text-muted)' }} />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                {/* NOTES */}
                {client.notes && (
                  <p className={styles.clientNotes}>{client.notes}</p>
                )}

                {/* LINKED CASES */}
                <div className={styles.linkedSection}>
                  <div className={styles.linkedHeader}>
                    <span className={styles.linkedLabel}>Linked Cases</span>
                    <span className={styles.linkedCount}>{clientCases.length}</span>
                  </div>

                  {clientCases.length === 0 ? (
                    <div className={styles.noLinked}>
                      <span>No cases linked</span>
                      <button className={styles.linkNowBtn}
                        onClick={() => { setLinkModal(client); setSelectedCase('') }}>
                        Link a case
                      </button>
                    </div>
                  ) : (
                    <div className={styles.casesList}>
                      {clientCases.map(c => (
                        <div key={c._id} className={styles.caseItem}>
                          <span className={styles.caseDot} style={{
                            background:
                              c.status === 'Open' ? 'var(--primary-light)' :
                                c.status === 'In Progress' ? 'var(--accent)' :
                                  'var(--success)'
                          }} />
                          <span className={styles.caseItemTitle}>{c.title}</span>
                          <span className={`badge badge-${c.status === 'Open' ? 'open' :
                            c.status === 'In Progress' ? 'progress' : 'closed'
                            }`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                            {c.status}
                          </span>
                          <button className={styles.unlinkBtn} title="Unlink case"
                            onClick={() => handleUnlinkCase(c._id)}>
                            <Close sx={{ fontSize: 11 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LINK CASE MODAL */}
      {linkModal && (
        <div className={styles.modal} onClick={() => setLinkModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Link Case to {linkModal.name}
              </h3>
              <button className="icon-btn danger" onClick={() => setLinkModal(null)}>
                <Close sx={{ fontSize: 16 }} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalSub}>
                Select a case to link to this client. Only unlinked cases are shown.
              </p>
              <label className="form-label">Select Case</label>
              <select className="input" value={selectedCase}
                onChange={e => setSelectedCase(e.target.value)}>
                <option value="">-- Choose a case --</option>
                {cases
                  .filter(c => !c.clientId)
                  .map(c => (
                    <option key={c._id} value={c._id}>
                      {c.title} — {c.clientName} ({c.status})
                    </option>
                  ))
                }
              </select>
              {cases.filter(c => !c.clientId).length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  All cases are already linked to clients.
                </p>
              )}
              <div className={styles.modalActions}>
                <button className="btn-ghost" onClick={() => setLinkModal(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleLinkCase}
                  disabled={!selectedCase}>
                  <LinkOutlined sx={{ fontSize: 14 }} /> Link Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}