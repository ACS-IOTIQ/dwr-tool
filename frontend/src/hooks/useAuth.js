import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { login } from '../api/authApi'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

export function useLogin() {
  const setAuth = useAuthStore(s => s.setAuth)
  const nav = useNavigate()

  return useMutation({
    mutationFn: async ({ email, password }) => {
      // Step 1: get token
      const { data: tokenData } = await login(email, password)
      const token = tokenData.access_token

      // Step 2: fetch /auth/me with token passed directly in header
      // (don't rely on Zustand state being set yet)
      const { data: user } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Step 3: now persist both together
      setAuth(token, user)
      return user
    },
    onSuccess: () => nav('/dashboard'),
    onError: (e) => console.error('Login failed', e),
  })
}

export function useLogout() {
  const clearAuth = useAuthStore(s => s.clearAuth)
  const nav = useNavigate()
  return () => { clearAuth(); nav('/login') }
}