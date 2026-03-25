import { useState, useEffect } from 'react'
import { iouService, paymentService } from '../services/api'

export default function History({ user }) {
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await iouService.getAll()
      const data = res.data.data
      
      const allIOUs = [...data.owedToMe, ...data.iOwe]
      const transactions = allIOUs.map(iou => ({
        id: iou.iou_id,
        type: 'iou',
        date: iou.created_at,
        amount: iou.amount,
        with: iou.borrower_name || iou.lender_name,
        reason: iou.reason,
        status: iou.status
      })).sort((a, b) => new Date(b.date) - new Date(a.date))

      setAllTransactions(transactions)
    } catch (err) {
      console.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTransactions = () => {
    switch(filter) {
      case 'paid':
        return allTransactions.filter(t => t.status === 'Paid')
      case 'unpaid':
        return allTransactions.filter(t => t.status === 'Unpaid')
      default:
        return allTransactions
    }
  }

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )

  const filtered = getFilteredTransactions()

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-5 fw-bold">📜 Transaction History</h1>
          </div>
          <div className="col-auto">
            <div className="btn-group" role="group">
              <input type="radio" className="btn-check" name="filter" id="all" value="all" checked={filter === 'all'} onChange={(e) => setFilter(e.target.value)} />
              <label className="btn btn-outline-primary" htmlFor="all">All</label>

              <input type="radio" className="btn-check" name="filter" id="paid" value="paid" checked={filter === 'paid'} onChange={(e) => setFilter(e.target.value)} />
              <label className="btn btn-outline-success" htmlFor="paid">Paid</label>

              <input type="radio" className="btn-check" name="filter" id="unpaid" value="unpaid" checked={filter === 'unpaid'} onChange={(e) => setFilter(e.target.value)} />
              <label className="btn btn-outline-warning" htmlFor="unpaid">Unpaid</label>
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>With</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((trans, idx) => (
                    <tr key={idx} className={trans.status === 'Paid' ? 'table-success' : 'table-warning table-warning'}>
                      <td>{new Date(trans.date).toLocaleDateString()}</td>
                      <td>
                        <span className="fw-bold">{trans.reason}</span><br/>
                        <small className="text-muted">IOU #{trans.id}</small>
                      </td>
                      <td>{trans.with}</td>
                      <td className="fw-bold">${trans.amount}</td>
                      <td>
                        <span className={`badge ${trans.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {trans.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <p className="text-muted fs-5">No transactions found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
