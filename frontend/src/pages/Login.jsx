import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/api'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(email, password)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold" style={{ fontSize: '2.5rem' }}>💰</h2>
                  <h3 className="fw-bold mb-1">PayBack</h3>
                  <p className="text-muted">Roommate IOU Tracker</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold">Email Address</label>
                    <input 
                      id="email"
                      type="email" 
                      className="form-control form-control-lg" 
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-bold">Password</label>
                    <input 
                      id="password"
                      type="password" 
                      className="form-control form-control-lg" 
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>

                <hr className="my-4"/>

                <p className="text-center text-muted mb-0">
                  Don't have an account? <Link to="/register" className="fw-bold text-decoration-none">Register</Link>
                </p>
              </div>
            </div>

            <div className="text-center text-white mt-4">
              <p className="small">Test Credentials:</p>
              <p className="small">Email: arshdeep@example.com | Password: Test@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
