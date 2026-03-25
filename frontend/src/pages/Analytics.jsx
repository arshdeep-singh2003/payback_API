import { useState, useEffect } from 'react'
import { iouService } from '../services/api'

export default function Analytics({ user }) {
  const [ious, setIOUs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await iouService.getAll()
      setIOUs(res.data.data)
      calculateStats(res.data.data)
    } catch (err) {
      console.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const allIOUs = [...data.owedToMe, ...data.iOwe]
    const paidIOUs = allIOUs.filter(i => i.status === 'Paid')
    const unpaidIOUs = allIOUs.filter(i => i.status === 'Unpaid')
    
    const totalOwed = allIOUs.reduce((sum, i) => sum + parseFloat(i.amount), 0)
    const totalPaid = paidIOUs.reduce((sum, i) => sum + parseFloat(i.amount), 0)
    const totalRemaining = unpaidIOUs.reduce((sum, i) => sum + parseFloat(i.remaining_balance), 0)
    
    const avgIOU = allIOUs.length > 0 ? (totalOwed / allIOUs.length).toFixed(2) : 0
    const completionRate = allIOUs.length > 0 ? ((paidIOUs.length / allIOUs.length) * 100).toFixed(1) : 0

    setStats({
      totalIOUs: allIOUs.length,
      paidIOUs: paidIOUs.length,
      unpaidIOUs: unpaidIOUs.length,
      totalOwed: totalOwed.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalRemaining: totalRemaining.toFixed(2),
      avgIOU,
      completionRate
    })
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
        <h1 className="display-5 fw-bold mb-4">📊 Analytics Dashboard</h1>

        {/* Statistics Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title text-muted mb-3">Total IOUs</h5>
                <h2 className="display-6 text-primary fw-bold">{stats.totalIOUs}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title text-muted mb-3">Paid IOUs</h5>
                <h2 className="display-6 text-success fw-bold">{stats.paidIOUs}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title text-muted mb-3">Unpaid IOUs</h5>
                <h2 className="display-6 text-warning fw-bold">{stats.unpaidIOUs}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title text-muted mb-3">Completion Rate</h5>
                <h2 className="display-6 text-info fw-bold">{stats.completionRate}%</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-header bg-primary bg-opacity-25">
                <h5 className="mb-0">💰 Financial Summary</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-6">
                    <p className="text-muted mb-1">Total Value</p>
                    <h4 className="text-primary fw-bold">${stats.totalOwed}</h4>
                  </div>
                  <div className="col-6">
                    <p className="text-muted mb-1">Already Paid</p>
                    <h4 className="text-success fw-bold">${stats.totalPaid}</h4>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <p className="text-muted mb-1">Still Pending</p>
                    <h4 className="text-warning fw-bold">${stats.totalRemaining}</h4>
                  </div>
                  <div className="col-6">
                    <p className="text-muted mb-1">Average IOU</p>
                    <h4 className="text-info fw-bold">${stats.avgIOU}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-header bg-success bg-opacity-25">
                <h5 className="mb-0">📈 Quick Insights</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <span className="badge bg-primary me-2">{stats.completionRate}%</span>
                    <span>of your IOUs are settled</span>
                  </li>
                  <li className="mb-3">
                    <span className="badge bg-warning text-dark me-2">{stats.unpaidIOUs}</span>
                    <span>IOUs still need attention</span>
                  </li>
                  <li className="mb-3">
                    <span className="badge bg-success me-2">${stats.totalRemaining}</span>
                    <span>outstanding to collect or pay</span>
                  </li>
                  <li className="mb-3">
                    <span className="badge bg-info me-2">${stats.avgIOU}</span>
                    <span>is your average IOU value</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
