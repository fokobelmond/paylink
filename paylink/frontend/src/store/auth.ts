import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'
import { authApi, type LoginInput, type RegisterInput } from '@/lib/api'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (data: LoginInput) => {
        const response = await authApi.login(data)

        if (response.success) {
          const { user, accessToken, refreshToken } = response.data

          // Sauvegarder le token dans localStorage pour les requêtes API
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            tokens: { accessToken, refreshToken },
            isAuthenticated: true,
            isLoading: false,
          })
        }
      },

      register: async (data: RegisterInput) => {
        const response = await authApi.register(data)

        if (response.success) {
          const { user, accessToken, refreshToken } = response.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            tokens: { accessToken, refreshToken },
            isAuthenticated: true,
            isLoading: false,
          })
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Ignorer les erreurs de logout
        } finally {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')

          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refreshAuth: async () => {
        const { tokens } = get()

        if (!tokens?.refreshToken) {
          set({ isLoading: false })
          return
        }

        try {
          const response = await authApi.refreshToken(tokens.refreshToken)

          if (response.success) {
            const { accessToken, refreshToken } = response.data

            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)

            set({
              tokens: { accessToken, refreshToken },
            })
          }
        } catch {
          // Token invalide, déconnecter
          await get().logout()
        }
      },

      checkAuth: async () => {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        try {
          const response = await authApi.me()

          if (response.success) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch {
          // Token invalide, essayer de rafraîchir
          try {
            await get().refreshAuth()

            // Réessayer après rafraîchissement
            const response = await authApi.me()

            if (response.success) {
              set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
              })
            }
          } catch {
            await get().logout()
          }
        }
      },

      setUser: (user: User) => set({ user }),

      setTokens: (tokens: AuthTokens) => {
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        set({ tokens })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

