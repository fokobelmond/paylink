'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageTemplate } from '@/components/templates'
import { pagesApi } from '@/lib/api'
import type { Page, ApiError } from '@/types'

export default function PublicPageView() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await pagesApi.getBySlug(slug)
        
        if (response.success && response.data) {
          setPage(response.data)
        } else {
          setError('Page non trouvée')
        }
      } catch (err) {
        const apiError = err as ApiError
        console.error('Erreur chargement page:', apiError.message)
        setError(apiError.message || 'Page non trouvée')
      }

      setIsLoading(false)
    }

    fetchPage()
  }, [slug])

  const handlePayment = async (serviceId?: string, amount?: number) => {
    setIsPaymentLoading(true)

    // Construire l'URL de paiement avec les paramètres
    const paymentParams = new URLSearchParams({
      pageId: page!.id,
      slug: page!.slug,
    })

    if (serviceId) {
      paymentParams.set('serviceId', serviceId)
    }

    if (amount) {
      paymentParams.set('amount', amount.toString())
    }

    // Rediriger vers la page de paiement
    router.push(`/pay?${paymentParams.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Page non trouvée
          </h1>
          <p className="text-slate-600 mb-6">
            Cette page n'existe pas ou a été supprimée.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  if (page.status !== 'PUBLISHED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Page en construction
          </h1>
          <p className="text-slate-600 mb-6">
            Cette page n'est pas encore disponible.
          </p>
        </div>
      </div>
    )
  }

  return (
    <PageTemplate
      page={page}
      onPayment={handlePayment}
      isLoading={isPaymentLoading}
    />
  )
}

