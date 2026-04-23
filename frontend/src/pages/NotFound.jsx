import { Link } from 'react-router-dom'

// Shown for any URL that doesn't match a defined route
export default function NotFound() {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="text-center text-white px-3">
        <h1 className="display-1 fw-bold mb-0">404</h1>
        <p className="fs-3 fw-semibold mb-2">Page Not Found</p>
        <p className="mb-4 opacity-75">
          Looks like this page went missing — kind of like that IOU you are still waiting on.
        </p>
        <Link to="/" className="btn btn-light btn-lg fw-bold px-5">
          Go Home
        </Link>
      </div>
    </div>
  )
}
