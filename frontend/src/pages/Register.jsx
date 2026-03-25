import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/api'

export default function Register({ setUser }) {
  const [name, setName] = useState('')
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
      const response = await authService.register(name, email, password)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="card" style={{ width: '400px' }}>
        <div className="card-body">
          <h3 className="card-title text-center mb-4">Register</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
