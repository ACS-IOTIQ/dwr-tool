import api from './axiosInstance'

export const getAnalysisUsers = () => api.get('/reports/analysis/users')
export const analyzeReports = (payload) => api.post('/reports/analysis', payload)

