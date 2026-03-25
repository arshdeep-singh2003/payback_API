import { useState, useEffect } from 'react'
import { userService, iouService } from '../services/api'

export default function Users({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [ious, setIOUs] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, iousRes] = await Promise.all([
        userService.getAll(),
        iouService.getAll()
      ])
      setUsers(usersRes.data.data)
      setIOUs(iousRes.data.data)
    } catch (err) {
      console.error('Failed to load data')
    } finally {
      setLoading(false)
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
    
    return {
      owedTo: owedTo.toFixed(2),
      owedBy: owedBy.toFixed(2),
      count: userIOUs.length
    }
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
        <h1 className="display-5 fw-bold mb-4">👥 Roommates Directory</h1>

        <div className="row g-4">
          {users.map(u => {
            const stats = getUserStats(u.user_id)
            return (
              <div key={u.user_id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1 fw-bold">{u.name}</h5>
                        <small className="text-muted">{u.email}</small>
                      </div>
                      <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <hr/>
                    
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
                      <div className="alert alert-info mb-0 small" role="alert">
                        {parseFloat(stats.owedTo) > parseFloat(stats.owedBy) 
                          ? `They owe you $${(parseFloat(stats.owedTo) - parseFloat(stats.owedBy)).toFixed(2)}`
                          : `You owe them $${(parseFloat(stats.owedBy) - parseFloat(stats.owedTo)).toFixed(2)}`
                        }
                      </div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
