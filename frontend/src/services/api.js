import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  register: (name, email, password) => API.post('/auth/register', { name, email, password }),
  login: (email, password) => API.post('/auth/login', { email, password })
}

export const iouService = {
  getAll: () => API.get('/ious'),
  getById: (id) => API.get(`/ious/${id}`),
  create: (borrower_id, amount, reason) => API.post('/ious', { borrower_id, amount, reason }),
  update: (id, data) => API.put(`/ious/${id}`, data),
  patch: (id, status) => API.patch(`/ious/${id}`, { status }),
  delete: (id) => API.delete(`/ious/${id}`)
}

export const paymentService = {
  get: (iou_id) => API.get(`/payments?iou_id=${iou_id}`),
  create: (iou_id, payment_amount) => API.post('/payments', { iou_id, payment_amount }),
  update: (id, payment_amount) => API.put(`/payments/${id}`, { payment_amount }),
  delete: (id) => API.delete(`/payments/${id}`)
}

export const userService = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`)
}

export default API
