import axios from 'axios'

const http = axios.create({
  baseURL: '/api/analytics',
  timeout: 15000,
})

const parseError = (error, endpoint) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    `Request failed for ${endpoint}`
  return new Error(message)
}

export const getStress = async () => {
  try {
    const response = await http.get('/stress')
    return Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    throw parseError(error, '/stress')
  }
}

export const getSummary = async () => {
  try {
    const response = await http.get('/summary')
    return response?.data ?? {}
  } catch (error) {
    throw parseError(error, '/summary')
  }
}

export const getAnomalies = async () => {
  try {
    const response = await http.get('/anomalies')
    return Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    throw parseError(error, '/anomalies')
  }
}

export const getCostImpact = async () => {
  try {
    const response = await http.get('/cost-impact')
    return Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    throw parseError(error, '/cost-impact')
  }
}

export const getForecast = async (departmentId) => {
  try {
    if (!departmentId) {
      return {}
    }
    const response = await http.get(`/forecast/${departmentId}`)
    return response?.data ?? {}
  } catch (error) {
    throw parseError(error, `/forecast/${departmentId}`)
  }
}

export const simulate = async (payload) => {
  try {
    const response = await http.post('/simulate', payload)
    return response?.data ?? {}
  } catch (error) {
    throw parseError(error, '/simulate')
  }
}

export const generateLoad = async () => {
  try {
    const response = await http.post('/generate-load')
    return response?.data ?? {}
  } catch (error) {
    throw parseError(error, '/generate-load')
  }
}
