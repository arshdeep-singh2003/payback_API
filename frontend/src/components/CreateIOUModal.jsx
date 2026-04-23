import { useState } from 'react'

export default function CreateIOUModal({ users, onClose, onCreate }) {
  const [role, setRole] = useState('lender')
  const [person_id, setPersonId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const isLender = role === 'lender'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!person_id || !amount || !reason) {
      setError('All fields are required')
      return
    }
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    const data = isLender
      ? { borrower_id: parseInt(person_id), amount: parseFloat(amount), reason, role: 'lender' }
      : { lender_id: parseInt(person_id), amount: parseFloat(amount), reason, role: 'borrower' }
    onCreate(data)
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

            {/* Role Toggle */}
            <div className="mb-4">
              <label className="form-label fw-bold">What happened?</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn flex-fill ${isLender ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => { setRole('lender'); setPersonId('') }}
                >
                  💚 I lent money
                </button>
                <button
                  type="button"
                  className={`btn flex-fill ${!isLender ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => { setRole('borrower'); setPersonId('') }}
                >
                  ❤️ I borrowed money
                </button>
              </div>
              <small className="text-muted mt-1 d-block">
                {isLender
                  ? 'Someone owes YOU — it will appear in "Money Owed to Me"'
                  : 'YOU owe someone — it will appear in "Money I Owe"'}
              </small>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="person" className="form-label fw-bold">
                  {isLender ? 'Borrower (who owes you)' : 'Lender (who you owe)'}
                </label>
                <select
                  id="person"
                  className="form-select form-select-lg"
                  value={person_id}
                  onChange={(e) => setPersonId(e.target.value)}
                  required
                  disabled={users.length === 0}
                >
                  <option value="">--- Select a person ---</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                {users.length === 0 && (
                  <div className="form-text text-warning mt-1">
                    No roommates added yet. Go to <strong>Users</strong> page and click <strong>"Add as Roommate"</strong> first.
                  </div>
                )}
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
