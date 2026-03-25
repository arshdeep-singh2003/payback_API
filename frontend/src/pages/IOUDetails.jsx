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
      setPaymentAmount('')
      fetchIOU()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment')
    }
  }

  const handleDeleteIOU = async () => {
    if (confirm('Delete this IOU?')) {
      try {
        await iouService.delete(id)
        navigate('/dashboard')
      } catch (err) {
        setError('Failed to delete IOU')
      }
    }
  }

  if (loading) return <div className="p-5">Loading...</div>
  if (!iou) return <div className="p-5">IOU not found</div>

  return (
    <div className="container py-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate('/dashboard')}>Back</button>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <h4 className="card-title">{iou.reason}</h4>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Amount:</strong> ${iou.amount}</p>
              <p><strong>Status:</strong> <span className={`badge ${iou.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>{iou.status}</span></p>
            </div>
            <div className="col-md-6">
              <p><strong>Paid:</strong> ${payments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0).toFixed(2)}</p>
              <p><strong>Remaining:</strong> ${(iou.amount - payments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0)).toFixed(2)}</p>
            </div>
          </div>

          {user.userId === iou.lender_id && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteIOU}>Delete IOU</button>
          )}
        </div>
      </div>

      <h5 className="mt-5">Payments</h5>
      {payments.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id}>
                <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                <td>${parseFloat(p.payment_amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No payments yet</p>
      )}

      {user.userId === iou.borrower_id && iou.status === 'Unpaid' && (
        <form onSubmit={handleAddPayment} className="mt-4">
          <div className="input-group">
            <input 
              type="number" 
              step="0.01"
              className="form-control" 
              placeholder="Payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required 
            />
            <button className="btn btn-primary" type="submit">Add Payment</button>
          </div>
        </form>
      )}
    </div>
  )
}
