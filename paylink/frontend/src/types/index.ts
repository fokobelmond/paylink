// Types PayLink

// ============================================
// UTILISATEUR
// ============================================

export interface User {
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

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
}

// ============================================
// TEMPLATES
// ============================================

export type TemplateType =
  | 'SERVICE_PROVIDER'
  | 'SIMPLE_SALE'
  | 'DONATION'
  | 'TRAINING'
  | 'EVENT'
  | 'ASSOCIATION'

export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED'

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  SERVICE_PROVIDER: 'Prestataire de services',
  SIMPLE_SALE: 'Vente simple',
  DONATION: 'Don / ONG',
  TRAINING: 'Formation',
  EVENT: 'Événement',
  ASSOCIATION: 'Association / Cotisation',
}

export const TEMPLATE_ICONS: Record<TemplateType, string> = {
  SERVICE_PROVIDER: '🔧',
  SIMPLE_SALE: '🛍️',
  DONATION: '❤️',
  TRAINING: '📚',
  EVENT: '🎉',
  ASSOCIATION: '🤝',
}

// ============================================
// PAGE
// ============================================

export interface Page {
  id: string
  slug: string
  userId: string
  templateType: TemplateType
  status: PageStatus
  title: string
  description: string | null
  logoUrl: string | null
  primaryColor: string
  templateData: TemplateData
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  services: Service[]
}

export interface PageCreateInput {
  slug: string
  templateType: TemplateType
  title: string
  description?: string
  logoUrl?: string
  primaryColor?: string
  templateData?: TemplateData
}

export interface PageUpdateInput {
  slug?: string
  title?: string
  description?: string
  logoUrl?: string
  primaryColor?: string
  templateData?: TemplateData
  status?: PageStatus
}

// ============================================
// TEMPLATE DATA (données spécifiques par template)
// ============================================

export type TemplateData =
  | ServiceProviderData
  | SimpleSaleData
  | DonationData
  | TrainingData
  | EventData
  | AssociationData

export interface ServiceProviderData {
  type: 'SERVICE_PROVIDER'
  profession?: string
  location?: string
  whatsapp?: string
}

export interface SimpleSaleData {
  type: 'SIMPLE_SALE'
  productName: string
  productImage?: string
  whatsapp?: string
}

export interface DonationData {
  type: 'DONATION'
  cause: string
  goal?: number
  collected?: number
  showProgress?: boolean
}

export interface TrainingData {
  type: 'TRAINING'
  trainingName: string
  duration?: string
  startDate?: string
  format?: 'online' | 'in-person' | 'hybrid'
  location?: string
}

export interface EventData {
  type: 'EVENT'
  eventName: string
  date: string
  time?: string
  location: string
  capacity?: number
  ticketsSold?: number
}

export interface AssociationData {
  type: 'ASSOCIATION'
  associationName: string
  membershipType?: string
  period?: 'monthly' | 'yearly' | 'one-time'
}

// ============================================
// SERVICE / ITEM (avec tarification)
// ============================================

export type PricingMode = 'NET_AMOUNT' | 'FIXED_PRICE'

export interface Service {
  id: string
  pageId: string
  name: string
  description: string | null
  // Tarification (nouveaux champs - optionnels pour rétrocompatibilité)
  pricingMode?: PricingMode
  basePrice?: number       // Montant saisi par le vendeur
  displayPrice?: number    // Prix affiché au client (frais inclus)
  netPrice?: number        // Montant que le vendeur reçoit
  // Prix affiché (toujours présent)
  price: number           // = displayPrice si défini, sinon prix simple
  isActive: boolean
  sortOrder: number
}

export interface ServiceCreateInput {
  name: string
  description?: string
  // Mode de tarification
  pricingMode?: PricingMode
  basePrice: number       // Montant saisi par le vendeur
  sortOrder?: number
}

export interface ServiceUpdateInput {
  name?: string
  description?: string
  pricingMode?: PricingMode
  basePrice?: number
  isActive?: boolean
  sortOrder?: number
}

// ============================================
// PAIEMENT / TRANSACTION
// ============================================

export type PaymentProvider = 'ORANGE_MONEY' | 'MTN_MOMO'

export type TransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  SUCCESS: 'Réussi',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé',
  REFUNDED: 'Remboursé',
}

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-slate-100 text-slate-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
}

export interface Transaction {
  id: string
  reference: string
  pageId: string
  serviceId: string | null
  // Montants (traçabilité financière)
  grossAmount: number     // Ce que le client a payé
  netAmount: number       // Ce que le vendeur reçoit
  providerFee: number     // Frais du provider
  platformFee: number     // Marge PayLink
  // Legacy
  amount: number          // = grossAmount
  currency: string
  // Panier
  cartItems?: Array<{
    serviceId: string
    quantity: number
    unitPrice: number
  }>
  // Payeur
  payerPhone: string
  payerName: string | null
  payerEmail: string | null
  // Paiement
  provider: PaymentProvider
  status: TransactionStatus
  providerReference: string | null
  createdAt: string
  paidAt: string | null
}

export interface PaymentInitInput {
  pageId: string
  serviceId?: string
  // Panier (optionnel - pour paiements multiples)
  cartItems?: Array<{
    serviceId: string
    quantity: number
  }>
  provider: PaymentProvider
  payerPhone: string
  payerName?: string
  payerEmail?: string
}

// ============================================
// ABONNEMENT
// ============================================

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED'

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  maxPages: number
  transactionFee: number
  startDate: string
  endDate: string | null
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  statusCode: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================
// STATISTIQUES DASHBOARD
// ============================================

export interface DashboardStats {
  totalPages: number
  totalTransactions: number
  totalRevenue: number
  pendingTransactions: number
  recentTransactions: Transaction[]
  revenueByDay: { date: string; amount: number }[]
}

