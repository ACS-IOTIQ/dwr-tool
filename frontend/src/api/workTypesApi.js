
// ── frontend/src/api/workTypesApi.js ─────────────────────────────
import api from './axiosInstance'

export const getWorkTypes = () => api.get('/work-types/')
export const createWorkType = (data) => api.post('/work-types/', data)
export const updateWorkType = (id, data) => api.put(`/work-types/${id}`, data)
