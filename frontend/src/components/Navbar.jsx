import { useNavigate } from 'react-router-dom'

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/dashboard">PayBack</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <span className="nav-link">{user?.name}</span>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
