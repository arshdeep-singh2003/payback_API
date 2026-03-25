import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient" style={{ backgroundColor: '#0d6efd' }}>
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" href="/dashboard" style={{ fontSize: '1.5rem' }}>
          💰 PayBack
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className={`nav-link ${isActive('/dashboard')}`} href="/dashboard">
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${isActive('/analytics')}`} href="/analytics">
                Analytics
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${isActive('/history')}`} href="/history">
                History
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${isActive('/users')}`} href="/users">
                Users
              </a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                {user?.name}
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a className="dropdown-item" href="/settings">Settings</a></li>
                <li><hr className="dropdown-divider"/></li>
                <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
