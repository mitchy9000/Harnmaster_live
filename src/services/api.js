import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookie with every request
})

export default api