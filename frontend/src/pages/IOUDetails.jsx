import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { iouService, paymentService } from '../services/api'

export default function IOUDetails({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [iou, setIOU] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchIOU()
  }, [id])

  const fetchIOU = async () => {
    try {
      setLoading(true)
      const res = await iouService.getById(id)
      setIOU(res.data.data.iou)
      setPayments(res.data.data.payments)
    } catch (err) {
      setError('Failed to load IOU')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = async (e) => {
    e.preventDefault()
    try {
      await paymentService.create(id, paymentAmount)
      setSuccess('Payment recorded successfully!')
      setPaymentAmount('')
      setTimeout(() => setSuccess(''), 3000)
      fetchIOU()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment')
    }
  }

  const handleDeleteIOU = async () => {
    if (confirm('Are you sure you want to delete this IOU? This action cannot be undone.')) {
      try {
        await iouService.delete(id)
        navigate('/dashboard')
      } catch (err) {
        setError('Failed to delete IOU')
      }
    }
  }

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )

  if (!iou) return (
    <div className="container py-5">
      <div className="alert alert-danger">IOU not found</div>
    </div>
  )

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0)
  const remaining = parseFloat(iou.amount) - totalPaid
  const progressPercent = (totalPaid / parseFloat(iou.amount)) * 100

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <button className="btn btn-outline-secondary mb-4" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>

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

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h3 className="card-title fw-bold mb-3">{iou.reason}</h3>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Original Amount</p>
                    <h4 className="fw-bold">${parseFloat(iou.amount).toFixed(2)}</h4>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Status</p>
                    <span className={`badge ${iou.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      {iou.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <p className="text-muted mb-2">Payment Progress</p>
                  <div className="progress" style={{ height: '2rem' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    >
                      {progressPercent.toFixed(0)}%
                    </div>
                  </div>
                  <small className="text-muted d-block mt-2">${totalPaid.toFixed(2)} of ${parseFloat(iou.amount).toFixed(2)} paid</small>
                </div>

                {/* Payment Summary */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="card bg-success bg-opacity-10">
                      <div className="card-body">
                        <p className="text-muted mb-1">Paid Amount</p>
                        <h5 className="text-success fw-bold">${totalPaid.toFixed(2)}</h5>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-warning bg-opacity-10">
                      <div className="card-body">
                        <p className="text-muted mb-1">Remaining Balance</p>
                        <h5 className="text-warning fw-bold">${remaining.toFixed(2)}</h5>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                {user.userId === iou.lender_id && (
                  <button 
                    className="btn btn-outline-danger w-100" 
                    onClick={handleDeleteIOU}
                  >
                    🗑️ Delete IOU
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Add Payment Form */}
            {user.userId === iou.borrower_id && iou.status === 'Unpaid' && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary bg-opacity-25">
                  <h5 className="mb-0">💳 Record Payment</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAddPayment}>
                    <div className="mb-3">
                      <label htmlFor="paymentAmount" className="form-label fw-bold">Payment Amount</label>
                      <input 
                        id="paymentAmount"
                        type="number" 
                        step="0.01"
                        className="form-control" 
                        placeholder={`Max: $${remaining.toFixed(2)}`}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required 
                      />
                      <small className="text-muted d-block mt-2">Remaining to pay: ${remaining.toFixed(2)}</small>
                    </div>
                    <button className="btn btn-primary w-100 fw-bold" type="submit">
                      Add Payment
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Payments History */}
            <div className="card shadow-sm">
              <div className="card-header bg-info bg-opacity-25">
                <h5 className="mb-0">📝 Payment History ({payments.length})</h5>
              </div>
              <div className="card-body">
                {payments.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {payments.map(p => (
                      <div key={p.payment_id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <div>
                          <p className="mb-1 fw-bold">${parseFloat(p.payment_amount).toFixed(2)}</p>
                          <small className="text-muted">{new Date(p.payment_date).toLocaleDateString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center">No payments recorded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
