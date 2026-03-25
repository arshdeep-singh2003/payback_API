import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { iouService, userService } from '../services/api'
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
      const [iouRes, usersRes] = await Promise.all([
        iouService.getAll(),
        userService.getAll()
      ])
      setIOUs(iouRes.data.data)
      setUsers(usersRes.data.data.filter(u => u.user_id !== user.userId))
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIOU = async (data) => {
    try {
      await iouService.create(data.borrower_id, data.amount, data.reason)
      setShowModal(false)
      fetchData()
    } catch (err) {
      setError('Failed to create IOU')
    }
  }

  if (loading) return <div className="p-5">Loading...</div>

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1>Dashboard</h1>
        </div>
        <div className="col text-end">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create IOU
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {ious && (
        <div className="row">
          <div className="col-md-6">
            <h4>Money Owed to Me</h4>
            <IOUList ious={ious.owedToMe} navigate={navigate} type="lender" />
            <p className="mt-2"><strong>Total: ${ious.summary.totalOwedToMe}</strong></p>
          </div>
          <div className="col-md-6">
            <h4>Money I Owe</h4>
            <IOUList ious={ious.iOwe} navigate={navigate} type="borrower" />
            <p className="mt-2"><strong>Total: ${ious.summary.totalIOwe}</strong></p>
          </div>
        </div>
      )}

      {showModal && (
        <CreateIOUModal 
          users={users}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateIOU}
        />
      )}
    </div>
  )
}
