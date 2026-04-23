import { useState, useEffect } from 'react'
import { userService, iouService, roommateService } from '../services/api'

export default function Users({ user }) {
  const [users, setUsers] = useState([])
  const [roommates, setRoommates] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [ious, setIOUs] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, iousRes, roommatesRes] = await Promise.all([
        userService.getAll(),
        iouService.getAll(),
        roommateService.getAll()
      ])
      const allUsers = usersRes.data.data.filter(u => u.user_id !== user.userId)
      setUsers(allUsers)
      setIOUs(iousRes.data.data)
      setRoommates(new Set(roommatesRes.data.data.map(r => r.user_id)))
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRoommate = async (userId) => {
    setActionLoading(userId)
    try {
      await roommateService.add(userId)
      setRoommates(prev => new Set([...prev, userId]))
    } catch (err) {
      setError('Failed to add roommate')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveRoommate = async (userId) => {
    setActionLoading(userId)
    try {
      await roommateService.remove(userId)
      setRoommates(prev => { const next = new Set(prev); next.delete(userId); return next })
    } catch (err) {
      setError('Failed to remove roommate')
    } finally {
      setActionLoading(null)
    }
  }

  const getUserStats = (userId) => {
    if (!ious) return { owedBy: 0, owedTo: 0, count: 0 }
    const allIOUs = [...ious.owedToMe, ...ious.iOwe]
    const userIOUs = allIOUs.filter(iou => iou.lender_id === userId || iou.borrower_id === userId)
    const owedTo = ious.owedToMe
      .filter(iou => iou.borrower_id === userId)
      .reduce((sum, iou) => sum + parseFloat(iou.remaining_balance), 0)
    const owedBy = ious.iOwe
      .filter(iou => iou.lender_id === userId)
      .reduce((sum, iou) => sum + parseFloat(iou.remaining_balance), 0)
    return { owedTo: owedTo.toFixed(2), owedBy: owedBy.toFixed(2), count: userIOUs.length }
  }

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-5 fw-bold mb-1">👥 Roommates Directory</h1>
            <p className="text-muted mb-0">
              {roommates.size} roommate{roommates.size !== 1 ? 's' : ''} added &bull; Add people to select them as borrowers when creating IOUs
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row g-4">
          {users.map(u => {
            const stats = getUserStats(u.user_id)
            const isRoommate = roommates.has(u.user_id)
            const isLoading = actionLoading === u.user_id
            return (
              <div key={u.user_id} className="col-md-6 col-lg-4">
                <div className={`card shadow-sm h-100 ${isRoommate ? 'border-primary border-2' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="card-title mb-0 fw-bold">{u.name}</h5>
                          {isRoommate && <span className="badge bg-primary">Roommate</span>}
                        </div>
                        <small className="text-muted">{u.email}</small>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                        style={{ width: '50px', height: '50px', fontSize: '1.5rem', flexShrink: 0 }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <hr />

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">They owe you</small>
                        <span className="badge bg-success">${stats.owedTo}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">You owe them</small>
                        <span className="badge bg-danger">${stats.owedBy}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">Total IOUs</small>
                        <span className="badge bg-info">{stats.count}</span>
                      </div>
                    </div>

                    {Math.abs(parseFloat(stats.owedTo) - parseFloat(stats.owedBy)) > 0 && (
                      <div className="alert alert-info mb-3 small" role="alert">
                        {parseFloat(stats.owedTo) > parseFloat(stats.owedBy)
                          ? `They owe you $${(parseFloat(stats.owedTo) - parseFloat(stats.owedBy)).toFixed(2)}`
                          : `You owe them $${(parseFloat(stats.owedBy) - parseFloat(stats.owedTo)).toFixed(2)}`
                        }
                      </div>
                    )}

                    {isRoommate ? (
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => handleRemoveRoommate(u.user_id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        ) : '✕ '}
                        Remove Roommate
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => handleAddRoommate(u.user_id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        ) : '+ '}
                        Add as Roommate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {users.length === 0 && (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <p className="text-muted fs-5">No other users found</p>
              <small className="text-muted">Other users appear here after they register</small>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
