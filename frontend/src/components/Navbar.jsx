import { useNavigate, useLocation, Link } from 'react-router-dom'

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
        <Link className="navbar-brand fw-bold" to="/dashboard" style={{ fontSize: '1.5rem' }}>
          💰 PayBack
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/analytics')}`} to="/analytics">
                Analytics
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/history')}`} to="/history">
                History
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/users')}`} to="/users">
                Users
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/roommates')}`} to="/roommates">
                Roommates
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                {user?.name}
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                <li><hr className="dropdown-divider"/></li>
                <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
              </ul>
            </li>
            <li className="nav-item ms-2">
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
