import api from './axiosInstance'

export const getMyCommitTasks = (params) =>
  api.get('/commit-tasks/my', { params })
