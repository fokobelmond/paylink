'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { pricingApi, type PaymentProvider, type PriceCalculation } from '@/lib/api'
import { formatCurrency, cn } from '@/lib/utils'
import { useDebouncedCallback } from 'use-debounce'

interface PriceInputProps {
  /** Montant initial (en FCFA) */
  initialValue?: number
  /** Mode de tarification par défaut */
  defaultMode?: 'net' | 'gross'
  /** Provider par défaut pour le calcul */
  defaultProvider?: PaymentProvider
  /** Callback quand les valeurs changent */
  onChange?: (values: {
    basePrice: number
    displayPrice: number
    netPrice: number
    mode: 'net' | 'gross'
  }) => void
  /** Label personnalisé */
  label?: string
  /** Afficher le sélecteur de mode */
  showModeSelector?: boolean
  /** Afficher le sélecteur de provider */
  showProviderSelector?: boolean
  /** Désactiver l'input */
  disabled?: boolean
  /** Message d'erreur externe */
  error?: string
}

/**
 * Composant de saisie des prix avec calcul automatique des frais
 * 
 * UX VENDEUR:
 * - Mode NET (défaut): "Je veux recevoir X FCFA"
 * - Mode GROSS: "Le prix public est X FCFA"
 * - Affichage rassurant des frais
 * - Calcul en temps réel
 */
export function PriceInput({
  initialValue = 0,
  defaultMode = 'net',
  defaultProvider = 'ORANGE_MONEY',
  onChange,
  label = 'Prix du service',
  showModeSelector = true,
  showProviderSelector = false,
  disabled = false,
  error: externalError,
}: PriceInputProps) {
  const [inputValue, setInputValue] = useState(initialValue.toString())
  const [mode, setMode] = useState<'net' | 'gross'>(defaultMode)
  const [provider, setProvider] = useState<PaymentProvider>(defaultProvider)
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Calcul avec debounce pour éviter trop de requêtes
  const calculatePrice = useDebouncedCallback(
    async (amount: number, pricingMode: 'net' | 'gross', paymentProvider: PaymentProvider) => {
      if (amount < 100) {
        setCalculation(null)
        setError(amount > 0 ? 'Le montant minimum est 100 FCFA' : null)
        return
      }

      setIsCalculating(true)
      setError(null)

      try {
        const result = await pricingApi.calculate(amount, pricingMode, paymentProvider)
        setCalculation(result)
        
        // Notifier le parent
        onChange?.({
          basePrice: amount,
          displayPrice: result.grossAmount,
          netPrice: result.netAmount,
          mode: pricingMode,
        })
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de calcul'
        setError(errorMessage)
        setCalculation(null)
      } finally {
        setIsCalculating(false)
      }
    },
    300 // 300ms de debounce
  )

  // Recalculer quand les valeurs changent
  useEffect(() => {
    const amount = parseInt(inputValue, 10)
    if (!isNaN(amount) && amount > 0) {
      calculatePrice(amount, mode, provider)
    }
  }, [inputValue, mode, provider, calculatePrice])

  // Formater l'input (séparateurs de milliers)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setInputValue(rawValue)
  }

  // Affichage formaté de la valeur
  const displayValue = inputValue ? parseInt(inputValue, 10).toLocaleString('fr-FR') : ''

  return (
    <div className="space-y-4">
      {/* Label et sélecteur de mode */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        
        {showModeSelector && (
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setMode('net')}
              disabled={disabled}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-all',
                mode === 'net'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Je veux recevoir
            </button>
            <button
              type="button"
              onClick={() => setMode('gross')}
              disabled={disabled}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-all',
                mode === 'gross'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Prix public fixé
            </button>
          </div>
        )}
      </div>

      {/* Input principal */}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="0"
          className={cn(
            'w-full px-4 py-3 pr-20 text-2xl font-bold text-slate-900 border-2 rounded-xl transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error || externalError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200',
            disabled && 'opacity-50 cursor-not-allowed bg-slate-50'
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isCalculating && (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          )}
          <span className="text-lg font-medium text-slate-500">FCFA</span>
        </div>
      </div>

      {/* Sélecteur de provider */}
      {showProviderSelector && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setProvider('ORANGE_MONEY')}
            disabled={disabled}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all',
              provider === 'ORANGE_MONEY'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            🟠 Orange Money
          </button>
          <button
            type="button"
            onClick={() => setProvider('MTN_MOMO')}
            disabled={disabled}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all',
              provider === 'MTN_MOMO'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            🟡 MTN MoMo
          </button>
        </div>
      )}

      {/* Message d'erreur */}
      <AnimatePresence>
        {(error || externalError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-600 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error || externalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résumé du calcul - Message rassurant */}
      <AnimatePresence>
        {calculation && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200"
          >
            {/* Message principal */}
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-emerald-800 font-medium">
                  {calculation.displayMessage}
                </p>
                
                {/* Montants clés */}
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-slate-500 mb-1">Client paie</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(calculation.grossAmount)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-slate-500 mb-1">Vous recevez</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(calculation.netAmount)}
                    </p>
                  </div>
                </div>

                {/* Toggle détails */}
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition"
                >
                  <Info className="w-3 h-3" />
                  {showDetails ? 'Masquer les détails' : 'Voir les détails des frais'}
                </button>

                {/* Détails des frais (optionnel) */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">
                            Frais {calculation.provider === 'ORANGE_MONEY' ? 'Orange Money' : 'MTN MoMo'}
                          </span>
                          <span className="text-slate-700">
                            {formatCurrency(calculation.providerFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Frais PayLink</span>
                          <span className="text-slate-700">
                            {formatCurrency(calculation.platformFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-medium pt-2 border-t border-dashed border-slate-200">
                          <span className="text-slate-600">Total frais</span>
                          <span className="text-slate-800">
                            {formatCurrency(calculation.totalFees)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aide contextuelle */}
      {!calculation && !error && inputValue === '' && (
        <div className="flex items-start gap-2 text-slate-500 text-sm">
          <Calculator className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            {mode === 'net'
              ? 'Entrez le montant que vous souhaitez recevoir. Les frais seront calculés automatiquement.'
              : 'Entrez le prix public. Nous calculerons ce que vous recevrez après frais.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default PriceInput

