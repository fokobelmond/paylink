'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { transactionsApi } from '@/lib/api'
import type { Transaction } from '@/types'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('ref')

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPayment = async () => {
      if (!reference) {
        setError('Référence de paiement manquante')
        setIsLoading(false)
        return
      }

      try {
        const response = await transactionsApi.checkStatus(reference)
        
        if (response.success && response.data) {
          setTransaction(response.data.transaction)
        } else {
          setError('Impossible de vérifier le paiement')
        }
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur lors de la vérification du paiement')
      }

      setIsLoading(false)
    }

    checkPayment()
  }, [reference])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Vérification du paiement...</p>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Erreur</h1>
          <p className="text-slate-600 mb-6">{error || 'Une erreur est survenue'}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const isSuccess = transaction.status === 'SUCCESS'
  const isPending = transaction.status === 'PENDING' || transaction.status === 'PROCESSING'

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isSuccess 
        ? 'bg-gradient-to-br from-green-50 to-emerald-100' 
        : isPending 
          ? 'bg-gradient-to-br from-yellow-50 to-amber-100'
          : 'bg-gradient-to-br from-red-50 to-rose-100'
    }`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icône */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isSuccess ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          {isSuccess ? (
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : isPending ? (
            <svg className="w-10 h-10 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isSuccess ? 'Paiement réussi !' : isPending ? 'Paiement en cours...' : 'Paiement échoué'}
        </h1>

        {/* Description */}
        <p className="text-slate-600 mb-6">
          {isSuccess 
            ? 'Votre paiement a été effectué avec succès.'
            : isPending
              ? 'Votre paiement est en cours de traitement. Vous recevrez une confirmation par SMS.'
              : 'Le paiement n\'a pas pu être effectué.'
          }
        </p>

        {/* Détails */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-500">Référence</span>
            <span className="font-mono font-medium">{transaction.reference}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-500">Montant</span>
            <span className="font-bold text-lg">{transaction.grossAmount.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Statut</span>
            <span className={`font-medium ${
              isSuccess ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {isSuccess ? 'Confirmé' : isPending ? 'En attente' : 'Échoué'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Retour à l'accueil
          </Link>
          
          {isPending && (
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Actualiser le statut
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

