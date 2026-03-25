import { useState } from 'react'

export default function CreateIOUModal({ users, onClose, onCreate }) {
  const [borrower_id, setBorrowerId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!borrower_id || !amount || !reason) {
      setError('All fields required')
      return
    }
    onCreate({ borrower_id: parseInt(borrower_id), amount: parseFloat(amount), reason })
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Create IOU</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Borrower</label>
                <select 
                  className="form-select" 
                  value={borrower_id}
                  onChange={(e) => setBorrowerId(e.target.value)}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Reason</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required 
                  placeholder="What's this for?"
                />
              </div>
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>Cancel</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
