import axios from 'axios'

// Use Vite environment variable if available, otherwise fallback to your live Render backend URL
const API_URL = import.meta.env.VITE_API_URL || 'https://task-management-system-1lta.onrender.com/'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api