'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Users, Target, Gift } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency, formatAmount, cn } from '@/lib/utils'
import type { PageTemplateProps } from './PageTemplate'
import type { DonationData } from '@/types'

/**
 * Template 3: Don / ONG
 * Usage: associations, ONG, collectes de fonds
 * Permet de faire un don avec montant libre ou prédéfini
 */
export function DonationTemplate({ page, onPayment, isLoading }: PageTemplateProps) {
  const templateData = page.templateData as DonationData
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const suggestedAmounts = [1000, 2500, 5000, 10000, 25000, 50000]

  const progress = templateData.goal && templateData.collected
    ? Math.min((templateData.collected / templateData.goal) * 100, 100)
    : 0

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount('')
  }

  const handleCustomAmount = (value: string) => {
    const numValue = parseInt(value.replace(/\D/g, ''), 10)
    setCustomAmount(value)
    setSelectedAmount(isNaN(numValue) ? null : numValue)
    setIsCustom(true)
  }

  const handlePayment = () => {
    if (selectedAmount && selectedAmount >= 100) {
      onPayment(undefined, selectedAmount)
    }
  }

  const finalAmount = isCustom ? selectedAmount : selectedAmount

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden"
        >
          {/* Header Image or Icon */}
          <div
            className="relative h-48 flex items-center justify-center"
            style={{ backgroundColor: `${page.primaryColor}15` }}
          >
            {page.logoUrl ? (
              <Image
                src={page.logoUrl}
                alt={page.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                  style={{ backgroundColor: page.primaryColor }}
                >
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Title & Cause */}
            <h1 className="text-2xl font-bold text-slate-900 text-center">
              {page.title}
            </h1>

            {templateData.cause && (
              <p
                className="text-center font-medium mt-2"
                style={{ color: page.primaryColor }}
              >
                {templateData.cause}
              </p>
            )}

            {page.description && (
              <p className="text-slate-600 mt-4 text-center leading-relaxed">
                {page.description}
              </p>
            )}

            {/* Progress bar (if goal is set) */}
            {templateData.showProgress && templateData.goal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Collecté</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(templateData.collected || 0)} / {formatCurrency(templateData.goal)}
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: page.primaryColor }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{Math.round(progress)}% de l'objectif atteint</span>
                </div>
              </motion.div>
            )}

            {/* Amount Selection */}
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-700 mb-3 text-center">
                Choisissez un montant
              </p>
              <div className="grid grid-cols-3 gap-2">
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={cn(
                      'py-3 rounded-lg font-medium transition-all border-2',
                      selectedAmount === amount && !isCustom
                        ? 'border-primary-500 text-primary-700'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    )}
                    style={
                      selectedAmount === amount && !isCustom
                        ? { borderColor: page.primaryColor, color: page.primaryColor }
                        : {}
                    }
                  >
                    {formatAmount(amount)}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mt-4">
                <Input
                  placeholder="Autre montant (min. 100 FCFA)"
                  value={customAmount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  leftIcon={<Gift className="w-5 h-5" />}
                  className={cn(
                    isCustom && selectedAmount
                      ? 'border-primary-500 ring-2 ring-primary-500/20'
                      : ''
                  )}
                />
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={!finalAmount || finalAmount < 100}
              isLoading={isLoading}
              className="w-full mt-6 py-4 text-lg"
              style={{ backgroundColor: page.primaryColor }}
              leftIcon={<Heart className="w-5 h-5" />}
            >
              {finalAmount && finalAmount >= 100
                ? `Faire un don de ${formatCurrency(finalAmount)}`
                : 'Entrez un montant'}
            </Button>

            {/* Trust message */}
            <p className="text-center text-sm text-slate-500 mt-4">
              Votre don est sécurisé et va directement à la cause
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Paiement sécurisé via PayLink
        </p>
      </div>
    </div>
  )
}

