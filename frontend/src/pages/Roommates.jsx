import { useState, useEffect } from 'react'
import { userService, roommateService } from '../services/api'

export default function Roommates({ user }) {
  const [allUsers, setAllUsers] = useState([])
  const [roommates, setRoommates] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, roommatesRes] = await Promise.all([
        userService.getAll(),
        roommateService.getAll()
      ])
      const roommateIds = new Set(roommatesRes.data.data.map(r => r.user_id))
      setRoommates(roommatesRes.data.data)
      setAllUsers(usersRes.data.data.filter(u => u.user_id !== user.userId))
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const roommateIds = new Set(roommates.map(r => r.user_id))

  const handleAdd = async (u) => {
    setActionLoading(u.user_id)
    setError('')
    try {
      await roommateService.add(u.user_id)
      setRoommates(prev => [...prev, u])
      setSuccess(`${u.name} added as roommate`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to add roommate')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (u) => {
    setActionLoading(u.user_id)
    setError('')
    try {
      await roommateService.remove(u.user_id)
      setRoommates(prev => prev.filter(r => r.user_id !== u.user_id))
      setSuccess(`${u.name} removed`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to remove roommate')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="display-5 fw-bold mb-1">🏠 Manage Roommates</h1>
        <p className="text-muted mb-4">Add roommates so you can create IOUs with them</p>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        {/* My Roommates */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary bg-opacity-10 border-0">
            <h5 className="mb-0 fw-bold">
              My Roommates
              <span className="badge bg-primary ms-2">{roommates.length}</span>
            </h5>
          </div>
          <div className="card-body p-0">
            {roommates.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <div style={{ fontSize: '2.5rem' }}>👤</div>
                <p className="mb-0">No roommates yet — add some below</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {roommates.map(r => (
                  <li key={r.user_id} className="list-group-item d-flex align-items-center justify-content-between py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                        style={{ width: '42px', height: '42px', flexShrink: 0 }}
                      >
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold">{r.name}</div>
                        <small className="text-muted">{r.email}</small>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemove(r)}
                      disabled={actionLoading === r.user_id}
                    >
                      {actionLoading === r.user_id
                        ? <span className="spinner-border spinner-border-sm" role="status"></span>
                        : 'Remove'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Add Roommates */}
        <div className="card shadow-sm">
          <div className="card-header bg-success bg-opacity-10 border-0">
            <h5 className="mb-0 fw-bold">Add a Roommate</h5>
          </div>
          <div className="card-body">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {filteredUsers.length === 0 ? (
              <div className="text-center py-3 text-muted">
                {allUsers.length === 0
                  ? 'No other registered users found. Share the app with your roommates so they can register.'
                  : 'No users match your search'}
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {filteredUsers.map(u => {
                  const isRoommate = roommateIds.has(u.user_id)
                  return (
                    <li key={u.user_id} className="list-group-item d-flex align-items-center justify-content-between py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: '42px', height: '42px', flexShrink: 0 }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{u.name}</div>
                          <small className="text-muted">{u.email}</small>
                        </div>
                      </div>
                      {isRoommate ? (
                        <span className="badge bg-primary">Already added</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAdd(u)}
                          disabled={actionLoading === u.user_id}
                        >
                          {actionLoading === u.user_id
                            ? <span className="spinner-border spinner-border-sm" role="status"></span>
                            : '+ Add'}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
