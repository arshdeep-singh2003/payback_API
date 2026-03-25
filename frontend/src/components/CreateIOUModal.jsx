import { useState } from 'react'

export default function CreateIOUModal({ users, onClose, onCreate }) {
  const [borrower_id, setBorrowerId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!borrower_id || !amount || !reason) {
      setError('All fields are required')
      return
    }
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    onCreate({ borrower_id: parseInt(borrower_id), amount: parseFloat(amount), reason })
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary bg-opacity-25 border-0">
            <h5 className="modal-title fw-bold">➕ Create New IOU</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="borrower" className="form-label fw-bold">Borrower</label>
                <select 
                  id="borrower"
                  className="form-select form-select-lg" 
                  value={borrower_id}
                  onChange={(e) => setBorrowerId(e.target.value)}
                  required
                >
                  <option value="">--- Select a person ---</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="amount" className="form-label fw-bold">Amount ($)</label>
                <input 
                  id="amount"
                  type="number" 
                  step="0.01"
                  className="form-control form-control-lg" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="reason" className="form-label fw-bold">Reason/Description</label>
                <input 
                  id="reason"
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="What was this money for?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required 
                />
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-lg fw-bold">Create IOU</button>
                <button type="button" className="btn btn-outline-secondary btn-lg" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
