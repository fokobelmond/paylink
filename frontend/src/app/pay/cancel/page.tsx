'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('ref')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icône */}
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Paiement annulé
        </h1>

        {/* Description */}
        <p className="text-slate-600 mb-6">
          Vous avez annulé le paiement. Aucun montant n'a été débité de votre compte.
        </p>

        {/* Référence */}
        {reference && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Référence</span>
              <span className="font-mono font-medium">{reference}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Retour à l'accueil
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Réessayer le paiement
          </button>
        </div>
      </div>
    </div>
  )
}

