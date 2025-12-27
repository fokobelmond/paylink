import type { ApiResponse, ApiError } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: RequestMethod
  body?: unknown
  headers?: Record<string, string>
  token?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, token } = options

    const authToken = token || this.getToken()

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...headers,
      },
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: ApiError = {
          success: false,
          error: errorData.error || 'Request failed',
          message: errorData.message || 'Une erreur est survenue',
          statusCode: response.status,
        }
        throw error
      }

      const data = await response.json()
      return data
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error
      }

      // Erreur réseau
      const networkError: ApiError = {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Problème de connexion. Vérifiez votre réseau.',
        statusCode: 0,
      }
      throw networkError
    }
  }

  // Méthodes raccourcies
  get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: 'GET', token })
  }

  post<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, { method: 'POST', body, token })
  }

  put<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, { method: 'PUT', body, token })
  }

  patch<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, { method: 'PATCH', body, token })
  }

  delete<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: 'DELETE', token })
  }
}

export const api = new ApiClient(API_URL)

// ============================================
// AUTH API
// ============================================

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    phone: string
    firstName: string
    lastName: string
    isVerified: boolean
    isActive: boolean
    createdAt: string
    lastLoginAt: string | null
  }
  accessToken: string
  refreshToken: string
}

export const authApi = {
  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', data),

  register: (data: RegisterInput) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  logout: () =>
    api.post<ApiResponse<void>>('/api/auth/logout', {}),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/api/auth/refresh',
      { refreshToken }
    ),

  me: () =>
    api.get<ApiResponse<AuthResponse['user']>>('/api/auth/me'),

  verifyPhone: (code: string) =>
    api.post<ApiResponse<void>>('/api/auth/verify-phone', { code }),

  resendVerification: () =>
    api.post<ApiResponse<void>>('/api/auth/resend-verification', {}),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<void>>('/api/auth/reset-password', { token, password }),
}

// ============================================
// PAGES API
// ============================================

import type { Page, PageCreateInput, PageUpdateInput, PaginatedResponse } from '@/types'

export const pagesApi = {
  list: (page = 1, limit = 10) =>
    api.get<ApiResponse<PaginatedResponse<Page>>>(`/api/pages?page=${page}&limit=${limit}`),

  get: (id: string) =>
    api.get<ApiResponse<Page>>(`/api/pages/${id}`),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Page>>(`/api/pages/slug/${slug}`),

  create: (data: PageCreateInput) =>
    api.post<ApiResponse<Page>>('/api/pages', data),

  update: (id: string, data: PageUpdateInput) =>
    api.patch<ApiResponse<Page>>(`/api/pages/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/api/pages/${id}`),

  publish: (id: string) =>
    api.post<ApiResponse<Page>>(`/api/pages/${id}/publish`, {}),

  unpublish: (id: string) =>
    api.post<ApiResponse<Page>>(`/api/pages/${id}/unpublish`, {}),

  checkSlug: (slug: string) =>
    api.get<ApiResponse<{ available: boolean }>>(`/api/pages/check-slug/${slug}`),
}

// ============================================
// SERVICES API
// ============================================

import type { Service, ServiceCreateInput, ServiceUpdateInput } from '@/types'

export const servicesApi = {
  list: (pageId: string) =>
    api.get<ApiResponse<Service[]>>(`/api/pages/${pageId}/services`),

  create: (pageId: string, data: ServiceCreateInput) =>
    api.post<ApiResponse<Service>>(`/api/pages/${pageId}/services`, data),

  update: (pageId: string, serviceId: string, data: ServiceUpdateInput) =>
    api.patch<ApiResponse<Service>>(`/api/pages/${pageId}/services/${serviceId}`, data),

  delete: (pageId: string, serviceId: string) =>
    api.delete<ApiResponse<void>>(`/api/pages/${pageId}/services/${serviceId}`),

  reorder: (pageId: string, serviceIds: string[]) =>
    api.post<ApiResponse<void>>(`/api/pages/${pageId}/services/reorder`, { serviceIds }),
}

// ============================================
// TRANSACTIONS API
// ============================================

import type { Transaction, PaymentInitInput, DashboardStats } from '@/types'

export const transactionsApi = {
  list: (page = 1, limit = 10) =>
    api.get<ApiResponse<PaginatedResponse<Transaction>>>(`/api/transactions?page=${page}&limit=${limit}`),

  get: (id: string) =>
    api.get<ApiResponse<Transaction>>(`/api/transactions/${id}`),

  getByReference: (reference: string) =>
    api.get<ApiResponse<Transaction>>(`/api/transactions/ref/${reference}`),

  // Cette route est publique (sans auth)
  initiate: (data: PaymentInitInput) =>
    api.post<ApiResponse<{ transaction: Transaction; paymentUrl?: string }>>('/api/payments/initiate', data),

  // Vérifier le statut d'un paiement (public)
  checkStatus: (reference: string) =>
    api.get<ApiResponse<{ status: string; transaction: Transaction }>>(`/api/payments/status/${reference}`),
}

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/api/dashboard/stats'),
}

// ============================================
// PRICING API (Calcul des frais)
// ============================================

export type PaymentProvider = 'ORANGE_MONEY' | 'MTN_MOMO'
export type PricingMode = 'net' | 'gross'

export interface PriceCalculation {
  grossAmount: number       // Ce que le client paie
  netAmount: number         // Ce que le vendeur reçoit
  providerFee: number       // Frais du provider (Orange/MTN)
  platformFee: number       // Marge PayLink
  totalFees: number         // Total des frais
  provider: PaymentProvider
  currency: string
  displayMessage: string    // Message explicatif pour le vendeur
}

export interface PublicPriceEstimate {
  displayAmount: number
  currency: string
  message: string           // "Montant final – frais inclus"
}

export const pricingApi = {
  /**
   * Calcul complet pour le vendeur (authentifié)
   * Retourne tous les détails des frais
   */
  calculate: (amount: number, mode: PricingMode, provider: PaymentProvider) =>
    api.post<PriceCalculation>('/api/pricing/calculate', { amount, mode, provider }),

  /**
   * Calcul pour un panier (vendeur authentifié)
   */
  calculateCart: (items: Array<{ serviceId: string; quantity: number }>, provider: PaymentProvider) =>
    api.post<PriceCalculation & { cartDetails: Array<{ serviceId: string; quantity: number; unitPrice: number; subtotal: number }> }>(
      '/api/pricing/calculate-cart',
      { items, provider }
    ),

  /**
   * Estimation rapide côté client (sans authentification)
   * Retourne uniquement le montant final sans détails
   */
  estimate: (netAmount: number, provider: PaymentProvider) =>
    api.get<PublicPriceEstimate>(`/api/pricing/estimate?netAmount=${netAmount}&provider=${provider}`),

  /**
   * Récupérer les frais actifs (admin)
   */
  getFees: () =>
    api.get<ApiResponse<unknown>>('/api/pricing/fees'),
}

