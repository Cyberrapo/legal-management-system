import { useEffect, useState } from 'react'
import {
  Add, Close, Edit, Delete, Person,
  Email, Phone, Home, LinkOutlined,
  Visibility, VisibilityOff
} from '@mui/icons-material'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './Clients.module.css'

const empty = { name: '', email: '', password: '', phone: '', address: '' }

export default function Clients() {
  const [clients, setClients]     = useState([])
  const [cases, setCases]         = useState([])
  const [form, setForm]           = useState(empty)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [linkModal, setLinkModal] = useState(null)
  const [selectedCase, setSelectedCase] = useState('')

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
    } catch {}
  }

  useEffect(() => { fetchClients(); fetchCases() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (editId) {
        await API.put(`/clients/${editId}`, form)
        toast.success('Client updated!')
      } else {
        await API.post('/clients', form)
        toast.success('Client account created!')
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
    setForm({ name: c.name, email: c.email, password: '', phone: c.phone || '', address: c.address || '' })
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

  const resetForm = () => {
    setShowForm(false); setEditId(null); setForm(empty)
  }

  const getClientCases = (clientId) =>
    cases.filter(c => c.clientId === clientId)

  return (
    <div className="animate-fade">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Client Portal</h2>
          <p className="page-subtitle">{clients.length} registered client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary"
          onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm
            ? <><Close sx={{fontSize:15}}/> Cancel</>
            : <><Add sx={{fontSize:15}}/> Add Client</>
          }
        </button>
      </div>

      {/* INFO BANNER */}
      <div className={styles.infoBanner}>
        <Person sx={{fontSize:16}}/>
        <span>Clients you add here will receive their own login credentials to view their cases, documents and appointments at the client portal.</span>
      </div>

      {/* FORM */}
      {showForm && (
        <div className={`card ${styles.formCard} animate-scale`}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>
              {editId ? 'Edit Client' : 'New Client Account'}
            </h3>
            <button className="icon-btn" onClick={resetForm}>
              <Close sx={{fontSize:16}}/>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label className="form-label">Full Name *</label>
                <input className="input" placeholder="Client full name"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input className="input" type="email" placeholder="client@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required disabled={!!editId} />
              </div>
              {!editId && (
                <div>
                  <label className="form-label">Password *</label>
                  <div className={styles.passWrap}>
                    <input className="input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Set a password for client"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      required />
                    <button type="button" className={styles.passToggle}
                      onClick={() => setShowPass(!showPass)}>
                      {showPass
                        ? <VisibilityOff sx={{fontSize:16}}/>
                        : <Visibility sx={{fontSize:16}}/>
                      }
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="form-label">Phone Number</label>
                <input className="input" placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-full">
                <label className="form-label">Address</label>
                <textarea className="input" style={{height:'68px',resize:'vertical'}}
                  placeholder="Client residential address"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editId ? 'Update Client' : 'Create Client Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLIENT GRID */}
      <div className={styles.clientGrid}>
        {clients.length === 0 ? (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <Person sx={{fontSize:52, color:'var(--text-muted)'}} className="empty-icon"/>
            <p className="empty-title">No clients yet</p>
            <p className="empty-subtitle">Add a client to give them portal access</p>
          </div>
        ) : clients.map(client => {
          const clientCases = getClientCases(client._id)
          return (
            <div key={client._id} className={`card ${styles.clientCard} animate-fade`}>
              <div className={styles.clientTop}>
                <div className={styles.clientAvatar}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.clientActions}>
                  <button className="icon-btn info" title="Link Case"
                    onClick={() => { setLinkModal(client); setSelectedCase('') }}>
                    <LinkOutlined sx={{fontSize:15}}/>
                  </button>
                  <button className="icon-btn" title="Edit"
                    onClick={() => handleEdit(client)}>
                    <Edit sx={{fontSize:14}}/>
                  </button>
                  <button className="icon-btn danger" title="Remove"
                    onClick={() => handleDelete(client._id)}>
                    <Delete sx={{fontSize:14}}/>
                  </button>
                </div>
              </div>

              <h3 className={styles.clientName}>{client.name}</h3>
              <span className={styles.clientRole}>Client</span>

              <div className={styles.clientInfo}>
                <div className={styles.infoRow}>
                  <Email sx={{fontSize:13, color:'var(--text-muted)'}}/>
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className={styles.infoRow}>
                    <Phone sx={{fontSize:13, color:'var(--text-muted)'}}/>
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className={styles.infoRow}>
                    <Home sx={{fontSize:13, color:'var(--text-muted)'}}/>
                    <span className={styles.infoAddress}>{client.address}</span>
                  </div>
                )}
              </div>

              <div className={styles.clientCasesSection}>
                <div className={styles.casesSectionTitle}>
                  Linked Cases
                  <span className={styles.casesCount}>{clientCases.length}</span>
                </div>
                {clientCases.length === 0 ? (
                  <p className={styles.noCases}>No cases linked yet</p>
                ) : (
                  <div className={styles.casesList}>
                    {clientCases.slice(0, 3).map(c => (
                      <div key={c._id} className={styles.caseItem}>
                        <span className={styles.caseDot}
                          style={{
                            background: c.status === 'Open' ? 'var(--primary-light)'
                              : c.status === 'In Progress' ? 'var(--accent)'
                              : 'var(--success)'
                          }}/>
                        <span className={styles.caseItemTitle}>{c.title}</span>
                        <span className={`badge badge-${c.status === 'Open' ? 'open'
                          : c.status === 'In Progress' ? 'progress' : 'closed'}`}
                          style={{fontSize:'9px', padding:'1px 6px'}}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                    {clientCases.length > 3 && (
                      <p className={styles.moreCases}>+{clientCases.length - 3} more</p>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.loginCredentials}>
                <span className={styles.credLabel}>Portal Login</span>
                <span className={styles.credEmail}>{client.email}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* LINK CASE MODAL */}
      {linkModal && (
        <div className={styles.modal} onClick={() => setLinkModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Link Case to {linkModal.name}
              </h3>
              <button className="icon-btn danger" onClick={() => setLinkModal(null)}>
                <Close sx={{fontSize:16}}/>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalSub}>
                Select a case to link. The client will be able to view this case in their portal.
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
              <div className={styles.modalActions}>
                <button className="btn-ghost" onClick={() => setLinkModal(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleLinkCase}>
                  <LinkOutlined sx={{fontSize:14}}/> Link Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}