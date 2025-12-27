'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users, CreditCard, Check, Calendar, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency, cn } from '@/lib/utils'
import type { PageTemplateProps } from './PageTemplate'
import type { AssociationData } from '@/types'

/**
 * Template 6: Association / Cotisation
 * Usage: associations, clubs, groupes
 * Permet de payer une cotisation (mensuelle, annuelle, unique)
 * 
 * UX CLIENT: Prix tout compris (frais inclus) - transparent pour l'acheteur
 */
export function AssociationTemplate({ page, onPayment, isLoading }: PageTemplateProps) {
  const templateData = page.templateData as AssociationData
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [memberName, setMemberName] = useState('')
  const [memberId, setMemberId] = useState('')

  // Utilise displayPrice (frais inclus) ou fallback sur price
  const getPrice = (service: typeof selectedService) => service?.displayPrice || service?.price || 0

  const periodLabels = {
    monthly: 'par mois',
    yearly: 'par an',
    'one-time': 'une fois',
  }

  const handlePayment = () => {
    if (selectedServiceId) {
      const service = page.services.find((s) => s.id === selectedServiceId)
      if (service) {
        onPayment(service.id, getPrice(service))
      }
    }
  }

  const selectedService = page.services.find((s) => s.id === selectedServiceId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div
            className="relative p-8 text-center"
            style={{ backgroundColor: page.primaryColor }}
          >
            {page.logoUrl ? (
              <Image
                src={page.logoUrl}
                alt={page.title}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg bg-white flex items-center justify-center">
                <Users
                  className="w-10 h-10"
                  style={{ color: page.primaryColor }}
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white mt-4">
              {templateData.associationName || page.title}
            </h1>
            {templateData.membershipType && (
              <p className="text-white/80 mt-1">{templateData.membershipType}</p>
            )}
          </div>

          <div className="p-6">
            {/* Description */}
            {page.description && (
              <p className="text-slate-600 text-center mb-6 leading-relaxed">
                {page.description}
              </p>
            )}

            {/* Membership Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Type de cotisation
                </p>
                <span className="text-xs text-slate-400">Frais inclus</span>
              </div>
              {page.services
                .filter((s) => s.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((service, index) => (
                  <motion.button
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      selectedServiceId === service.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                    style={
                      selectedServiceId === service.id
                        ? { borderColor: page.primaryColor }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition',
                            selectedServiceId === service.id
                              ? 'bg-emerald-500'
                              : 'border-slate-300'
                          )}
                          style={
                            selectedServiceId === service.id
                              ? { backgroundColor: page.primaryColor, borderColor: page.primaryColor }
                              : {}
                          }
                        >
                          {selectedServiceId === service.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-slate-500">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold text-lg"
                          style={{ color: page.primaryColor }}
                        >
                          {formatCurrency(getPrice(service))}
                        </p>
                        {templateData.period && (
                          <p className="text-xs text-slate-500">
                            {periodLabels[templateData.period]}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
            </div>

            {/* Member Info (optional) */}
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-slate-700">
                Vos informations
              </p>
              <Input
                placeholder="Nom complet du membre"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                leftIcon={<Users className="w-5 h-5" />}
              />
              <Input
                placeholder="Numéro de membre (optionnel)"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                leftIcon={<Award className="w-5 h-5" />}
              />
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Avantages membre
              </p>
              <ul className="space-y-2">
                {[
                  'Accès aux événements exclusifs',
                  'Réseau de membres actifs',
                  'Newsletter mensuelle',
                  'Réductions partenaires',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: page.primaryColor }}
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={!selectedServiceId}
              isLoading={isLoading}
              className="w-full mt-6 py-4 text-lg"
              style={{
                backgroundColor: selectedServiceId ? page.primaryColor : undefined,
              }}
              leftIcon={<CreditCard className="w-5 h-5" />}
            >
              {selectedService
                ? `Payer la cotisation • ${formatCurrency(getPrice(selectedService))}`
                : 'Sélectionnez une cotisation'}
            </Button>

            {/* Mention frais inclus */}
            {selectedService && (
              <p className="text-center text-xs text-slate-400 mt-2">
                Frais de transfert inclus
              </p>
            )}

            {/* Trust */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>
                {templateData.period === 'monthly'
                  ? 'Renouvellement mensuel'
                  : templateData.period === 'yearly'
                  ? 'Renouvellement annuel'
                  : 'Paiement unique'}
              </span>
            </div>
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

