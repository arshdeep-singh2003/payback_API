import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Settings({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('profile')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    setMessage('Password updated successfully!')
    setPassword('')
    setConfirmPassword('')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <h1 className="display-5 fw-bold mb-4">⚙️ Settings</h1>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="list-group">
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Profile
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                🔐 Security
              </button>
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                ℹ️ About
              </button>
            </div>
          </div>

          <div className="col-lg-9">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card shadow-sm">
                <div className="card-header bg-primary bg-opacity-25">
                  <h5 className="mb-0">Profile Information</h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <label className="form-label fw-bold">Full Name</label>
                    <input type="text" className="form-control" value={user.name} disabled />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Email Address</label>
                    <input type="email" className="form-control" value={user.email} disabled />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">User ID</label>
                    <input type="text" className="form-control" value={user.userId} disabled />
                  </div>
                  <div className="alert alert-info">
                    <strong>ℹ️ Note:</strong> Profile information cannot be edited. Please contact support for changes.
                  </div>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="card shadow-sm">
                <div className="card-header bg-primary bg-opacity-25">
                  <h5 className="mb-0">Change Password</h5>
                </div>
                <div className="card-body">
                  {message && (
                    <div className={`alert alert-${message.includes('successfully') ? 'success' : 'danger'} alert-dismissible fade show`}>
                      {message}
                      <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                    </div>
                  )}
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-bold">Confirm Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">Update Password</button>
                  </form>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="card shadow-sm">
                <div className="card-header bg-primary bg-opacity-25">
                  <h5 className="mb-0">About PayBack</h5>
                </div>
                <div className="card-body">
                  <h6 className="fw-bold mb-3">💰 PayBack v1.0.0</h6>
                  <p>An informal roommate IOU tracker designed to simplify shared expense management between friends and roommates.</p>
                  
                  <h6 className="fw-bold mt-4 mb-3">🎯 Features</h6>
                  <ul>
                    <li>Track IOUs between roommates</li>
                    <li>Record and manage payments</li>
                    <li>View detailed analytics</li>
                    <li>Secure user authentication</li>
                    <li>Real-time balance tracking</li>
                  </ul>

                  <h6 className="fw-bold mt-4 mb-3">🛠️ Technology</h6>
                  <p><strong>Frontend:</strong> React 18 + Bootstrap 5 + Vite</p>
                  <p><strong>Backend:</strong> Node.js + Express + PostgreSQL</p>
                  <p><strong>Authentication:</strong> JWT (JSON Web Tokens)</p>

                  <h6 className="fw-bold mt-4 mb-3">📝 Developer</h6>
                  <p>Arshdeep Singh</p>

                  <hr/>

                  <div className="d-grid gap-2">
                    <button className="btn btn-danger" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
