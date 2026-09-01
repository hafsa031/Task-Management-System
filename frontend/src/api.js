import axios from 'axios'

// Hardcoded directly to your live Render backend for the viva demo
const API_URL = 'https://task-management-system-1lta.onrender.com'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api