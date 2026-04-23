import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { iouService, roommateService } from '../services/api'
import IOUList from '../components/IOUList'
import CreateIOUModal from '../components/CreateIOUModal'

export default function Dashboard({ user }) {
  const [ious, setIOUs] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [iouRes, roommatesRes] = await Promise.all([
        iouService.getAll(),
        roommateService.getAll()
      ])
      setIOUs(iouRes.data.data)
      setUsers(roommatesRes.data.data)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIOU = async (data) => {
    try {
      await iouService.create(data)
      setShowModal(false)
      fetchData()
    } catch (err) {
      setError('Failed to create IOU')
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
        <div className="row mb-5">
          <div className="col">
            <h1 className="display-5 fw-bold text-dark">Welcome, {user.name}! 👋</h1>
            <p className="text-muted">Manage your IOUs and keep track of shared expenses</p>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
              ➕ Create IOU
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}<button type="button" className="btn-close" onClick={() => setError('')}></button></div>}

        {ious && (
          <>
            {/* Summary Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card bg-success bg-opacity-10 border-success shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="card-text text-muted mb-2">Money Owed to You</p>
                        <h3 className="card-title text-success">${ious.summary.totalOwedToMe}</h3>
                      </div>
                      <div style={{ fontSize: '3rem' }}>💚</div>
                    </div>
                    <small className="text-muted">{ious.owedToMe.filter(i => i.status === 'Unpaid').length} unpaid IOUs</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-danger bg-opacity-10 border-danger shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="card-text text-muted mb-2">Money You Owe</p>
                        <h3 className="card-title text-danger">${ious.summary.totalIOwe}</h3>
                      </div>
                      <div style={{ fontSize: '3rem' }}>❤️</div>
                    </div>
                    <small className="text-muted">{ious.iOwe.filter(i => i.status === 'Unpaid').length} unpaid IOUs</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-info bg-opacity-10 border-info shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="card-text text-muted mb-2">Total Tracked</p>
                        <h3 className="card-title text-info">${(parseFloat(ious.summary.totalOwedToMe) + parseFloat(ious.summary.totalIOwe)).toFixed(2)}</h3>
                      </div>
                      <div style={{ fontSize: '3rem' }}>📊</div>
                    </div>
                    <small className="text-muted">{ious.summary.unpaidIOUsCount} total unpaid</small>
                  </div>
                </div>
              </div>
            </div>

            {/* IOUs Sections */}
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-success bg-opacity-25 border-success">
                    <h5 className="mb-0">💸 Money Owed to Me</h5>
                  </div>
                  <div className="card-body">
                    <IOUList ious={ious.owedToMe} navigate={navigate} type="lender" />
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card shadow-sm">
                  <div className="card-header bg-danger bg-opacity-25 border-danger">
                    <h5 className="mb-0">💳 Money I Owe</h5>
                  </div>
                  <div className="card-body">
                    <IOUList ious={ious.iOwe} navigate={navigate} type="borrower" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showModal && (
          <CreateIOUModal 
            users={users}
            onClose={() => setShowModal(false)}
            onCreate={handleCreateIOU}
          />
        )}
      </div>
    </div>
  )
}
