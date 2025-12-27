import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine les classes CSS avec tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formater un montant en FCFA
 */
export function formatCurrency(amount: number, currency = 'XAF'): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formater un montant simple (sans symbole)
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-CM').format(amount)
}

/**
 * Formater une date relative
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-CM', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Formater une date complète
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-CM', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formater une date avec heure
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-CM', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Générer un slug à partir d'un texte
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Espaces en tirets
    .replace(/-+/g, '-') // Tirets multiples en un seul
    .replace(/^-|-$/g, '') // Supprimer tirets au début/fin
    .slice(0, 50) // Limiter la longueur
}

/**
 * Valider un numéro de téléphone camerounais
 */
export function isValidCameroonPhone(phone: string): boolean {
  // Formats acceptés: 6XXXXXXXX, +237 6XXXXXXXX, 237 6XXXXXXXX
  const cleaned = phone.replace(/\s+/g, '').replace('+', '')
  
  // Vérifier le format
  if (cleaned.startsWith('237')) {
    return /^237[6][0-9]{8}$/.test(cleaned)
  }
  
  return /^[6][0-9]{8}$/.test(cleaned)
}

/**
 * Normaliser un numéro de téléphone camerounais
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace('+', '')
  
  if (cleaned.startsWith('237')) {
    return cleaned
  }
  
  return `237${cleaned}`
}

/**
 * Détecter l'opérateur depuis le numéro
 */
export function detectOperator(phone: string): 'ORANGE_MONEY' | 'MTN_MOMO' | null {
  const normalized = normalizePhone(phone)
  const prefix = normalized.slice(3, 5) // Les 2 premiers chiffres après 237

  // Préfixes Orange: 65, 66, 67, 68, 69
  if (['65', '66', '67', '68', '69'].includes(prefix)) {
    return 'ORANGE_MONEY'
  }

  // Préfixes MTN: 65, 67, 68 (certains partagés), 50, 51, 52, 53, 54
  if (['50', '51', '52', '53', '54'].includes(prefix)) {
    return 'MTN_MOMO'
  }

  // Pour les préfixes partagés, on retourne null
  return null
}

/**
 * Générer une couleur aléatoire pour les avatars
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Obtenir les initiales d'un nom
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Tronquer un texte
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Copier dans le presse-papier
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback pour les navigateurs plus anciens
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

/**
 * Délai en millisecondes
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

