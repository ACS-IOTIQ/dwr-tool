import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as usersApi from '../api/usersApi'
import { message } from 'antd'

const handleApiError = (e, fallback = 'An error occurred') => {
  const detail = e.response?.data?.detail
  if (Array.isArray(detail)) {
    const msgs = detail.map(d => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ')
    message.error(msgs)
  } else if (typeof detail === 'string') {
    message.error(detail)
  } else {
    message.error(fallback)
  }
}

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers().then(r => r.data)
  })

export const useVisibleUsers = () =>
  useQuery({
    queryKey: ['visible-users'],
    queryFn: () => usersApi.getVisibleUsers().then(r => r.data),
  })

export const useManagers = () =>
  useQuery({
    queryKey: ['managers'],
    queryFn: () => usersApi.getManagers().then(r => r.data)
  })

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => usersApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries(['users'])
      message.success('User created')
    },
    onError: (e) => handleApiError(e, 'Error creating user'),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['users'])
      message.success('User updated')
    },
    onError: (e) => handleApiError(e, 'Error updating user'),
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => usersApi.deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries(['users'])
      message.success('User deactivated')
    },
    onError: (e) => handleApiError(e, 'Error deactivating user'),
  })
}
