import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import IOUDetails from './pages/IOUDetails'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user')))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>Loading...</div>
  }

  return (
    <>
      {user && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/iou/:id" element={user ? <IOUDetails user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default App
