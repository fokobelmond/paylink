'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { PageTemplateProps } from './PageTemplate'
import type { TrainingData } from '@/types'

/**
 * Template 4: Formation
 * Usage: formateurs, écoles privées, cours en ligne
 * Affiche les détails d'une formation avec inscription/paiement
 * 
 * UX CLIENT: Prix tout compris (frais inclus) - transparent pour l'acheteur
 */
export function TrainingTemplate({ page, onPayment, isLoading }: PageTemplateProps) {
  const templateData = page.templateData as TrainingData
  
  // Le premier service actif représente la formation principale
  const training = page.services.find((s) => s.isActive)

  // Utilise displayPrice (frais inclus) ou fallback sur price
  const getPrice = (service: typeof training) => service?.displayPrice || service?.price || 0

  const handlePayment = () => {
    if (training) {
      onPayment(training.id, getPrice(training))
    }
  }

  const formatIcons = {
    online: Video,
    'in-person': MapPin,
    hybrid: Users,
  }

  const formatLabels = {
    online: 'En ligne',
    'in-person': 'Présentiel',
    hybrid: 'Hybride',
  }

  const FormatIcon = templateData.format ? formatIcons[templateData.format] : BookOpen

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div
            className="relative h-40 flex items-center justify-center"
            style={{ backgroundColor: page.primaryColor }}
          >
            {page.logoUrl ? (
              <Image
                src={page.logoUrl}
                alt={page.title}
                fill
                className="object-cover opacity-20"
              />
            ) : null}
            <div className="relative text-center text-white px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mx-auto flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">
                {templateData.trainingName || page.title}
              </h1>
            </div>
          </div>

          <div className="p-6">
            {/* Price Badge */}
            {training && (
              <div className="flex justify-center -mt-10 mb-6">
                <div
                  className="px-6 py-3 bg-white rounded-xl shadow-lg border border-slate-100 text-center"
                >
                  <span className="text-sm text-slate-500">Prix de la formation</span>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: page.primaryColor }}
                  >
                    {formatCurrency(getPrice(training))}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Frais de transfert inclus
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {page.description && (
              <p className="text-slate-600 text-center leading-relaxed">
                {page.description}
              </p>
            )}

            {/* Training Details */}
            <div className="mt-6 space-y-3">
              {templateData.startDate && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Date de début</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(templateData.startDate)}
                    </p>
                  </div>
                </div>
              )}

              {templateData.duration && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Durée</p>
                    <p className="font-medium text-slate-900">
                      {templateData.duration}
                    </p>
                  </div>
                </div>
              )}

              {templateData.format && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <FormatIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Format</p>
                    <p className="font-medium text-slate-900">
                      {formatLabels[templateData.format]}
                      {templateData.location && templateData.format !== 'online' && (
                        <span className="text-slate-500"> • {templateData.location}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* What you'll learn (from services list) */}
            {page.services.length > 1 && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Ce que vous apprendrez
                </h3>
                <ul className="space-y-2">
                  {page.services
                    .filter((s) => s.isActive && s.id !== training?.id)
                    .map((module) => (
                      <li
                        key={module.id}
                        className="flex items-start gap-2 text-slate-600"
                      >
                        <CheckCircle
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          style={{ color: page.primaryColor }}
                        />
                        <span>{module.name}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            {training && (
              <Button
                onClick={handlePayment}
                isLoading={isLoading}
                className="w-full mt-6 py-4 text-lg"
                style={{ backgroundColor: page.primaryColor }}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                S'inscrire • {formatCurrency(getPrice(training))}
              </Button>
            )}

            {!training && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-700">
                Inscriptions bientôt disponibles
              </div>
            )}

            {/* Guarantee */}
            <p className="text-center text-sm text-slate-500 mt-4">
              Paiement sécurisé • Accès immédiat après inscription
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

