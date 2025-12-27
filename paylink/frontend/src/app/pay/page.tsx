'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Wallet,
  Phone,
  User,
  ArrowLeft,
  Shield,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency, isValidCameroonPhone, cn } from '@/lib/utils'
import type { PaymentProvider } from '@/types'

const paymentSchema = z.object({
  payerPhone: z.string().refine(isValidCameroonPhone, 'Numéro invalide'),
  payerName: z.string().min(2, 'Minimum 2 caractères'),
})

type PaymentFormData = z.infer<typeof paymentSchema>

function PaymentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageId = searchParams.get('pageId')
  const slug = searchParams.get('slug')
  const serviceId = searchParams.get('serviceId')
  const amountParam = searchParams.get('amount')

  const amount = amountParam ? parseInt(amountParam, 10) : 0

  const [provider, setProvider] = useState<PaymentProvider | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [transactionRef, setTransactionRef] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  const phoneValue = watch('payerPhone')

  // Détection automatique de l'opérateur basée sur le préfixe du numéro
  useEffect(() => {
    if (!phoneValue || phoneValue.length < 2) {
      setProvider(null)
      return
    }

    const cleaned = phoneValue.replace(/\s+/g, '').replace('+237', '').replace('237', '')
    const prefix = cleaned.slice(0, 2)

    // Préfixes Orange: 65, 66, 67, 68, 69
    if (['65', '66', '67', '68', '69'].includes(prefix)) {
      setProvider('ORANGE_MONEY')
    }
    // Préfixes MTN: 50, 51, 52, 53, 54, 67, 68 (certains partagés)
    else if (['50', '51', '52', '53', '54'].includes(prefix)) {
      setProvider('MTN_MOMO')
    } else {
      setProvider(null)
    }
  }, [phoneValue])

  const onSubmit = async (data: PaymentFormData) => {
    if (!provider) {
      return
    }

    setIsLoading(true)
    setStep('processing')

    try {
      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Générer une référence de transaction
      const ref = `PL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setTransactionRef(ref)
      setStep('success')
    } catch (error) {
      setStep('form')
      // Gérer l'erreur
    } finally {
      setIsLoading(false)
    }
  }

  if (!pageId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Paramètres manquants
          </h1>
          <p className="text-slate-600 mb-6">
            Impossible de procéder au paiement.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  // Étape de traitement
  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
            <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              {provider === 'ORANGE_MONEY' ? (
                <span className="text-2xl font-bold text-orange-500">OM</span>
              ) : (
                <span className="text-2xl font-bold text-yellow-500">M</span>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Paiement en cours...
          </h2>

          <p className="text-slate-600 mb-4">
            Validez le paiement sur votre téléphone
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
            <p className="text-sm text-blue-700">
              {provider === 'ORANGE_MONEY' ? (
                <>
                  Composez <strong>#150#</strong> sur votre téléphone et suivez
                  les instructions
                </>
              ) : (
                <>
                  Composez <strong>*126#</strong> sur votre téléphone et suivez
                  les instructions
                </>
              )}
            </p>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            Montant : <strong>{formatCurrency(amount)}</strong>
          </p>
        </motion.div>
      </div>
    )
  }

  // Étape de succès
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green-500 mx-auto mb-6 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Paiement réussi !
          </h2>

          <p className="text-slate-600 mb-6">
            Votre paiement de {formatCurrency(amount)} a été confirmé.
          </p>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-soft mb-6">
            <p className="text-sm text-slate-500 mb-1">Référence</p>
            <p className="text-lg font-mono font-bold text-slate-900">
              {transactionRef}
            </p>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            Un SMS de confirmation a été envoyé à votre numéro.
          </p>

          {slug && (
            <Link
              href={`/p/${slug}`}
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
            >
              Retour à la page
            </Link>
          )}
        </motion.div>
      </div>
    )
  }

  // Formulaire de paiement
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {slug ? (
            <Link
              href={`/p/${slug}`}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-slate-900">PayLink</span>
          </div>
        </div>

        {/* Payment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden"
        >
          {/* Amount Header */}
          <div className="bg-slate-900 p-6 text-center text-white">
            <p className="text-slate-400 text-sm mb-1">Montant à payer</p>
            <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Provider Selection */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                Méthode de paiement
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider('ORANGE_MONEY')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    provider === 'ORANGE_MONEY'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">OM</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    Orange Money
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('MTN_MOMO')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    provider === 'MTN_MOMO'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-400 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-sm">M</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">MTN MoMo</p>
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <Input
              label="Numéro de téléphone"
              type="tel"
              placeholder="6XX XXX XXX"
              leftIcon={<Phone className="w-5 h-5" />}
              hint="Le numéro associé à votre compte Mobile Money"
              error={errors.payerPhone?.message}
              {...register('payerPhone')}
            />

            {/* Name */}
            <Input
              label="Votre nom"
              placeholder="Jean Dupont"
              leftIcon={<User className="w-5 h-5" />}
              error={errors.payerName?.message}
              {...register('payerName')}
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={!provider}
              isLoading={isLoading}
              className={cn(
                'w-full py-4 text-lg',
                provider === 'ORANGE_MONEY' && 'bg-orange-500 hover:bg-orange-600',
                provider === 'MTN_MOMO' && 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
              )}
            >
              {provider
                ? `Payer avec ${provider === 'ORANGE_MONEY' ? 'Orange Money' : 'MTN MoMo'}`
                : 'Sélectionnez une méthode'}
            </Button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Shield className="w-4 h-4 text-green-500" />
              Paiement 100% sécurisé
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          En payant, vous acceptez nos{' '}
          <Link href="/terms" className="underline">
            conditions d'utilisation
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  )
}

