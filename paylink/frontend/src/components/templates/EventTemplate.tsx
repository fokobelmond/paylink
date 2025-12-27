'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  Share2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { PageTemplateProps } from './PageTemplate'
import type { EventData } from '@/types'

/**
 * Template 5: Événement
 * Usage: concerts, conférences, ateliers
 * Affiche les détails de l'événement avec achat de billets
 * 
 * UX CLIENT: Prix tout compris (frais inclus) - transparent pour l'acheteur
 */
export function EventTemplate({ page, onPayment, isLoading }: PageTemplateProps) {
  const templateData = page.templateData as EventData
  
  // Le premier service actif représente le billet principal
  const ticket = page.services.find((s) => s.isActive)

  // Utilise displayPrice (frais inclus) ou fallback sur price
  const getPrice = (service: typeof ticket) => service?.displayPrice || service?.price || 0

  const ticketsRemaining = templateData.capacity && templateData.ticketsSold
    ? templateData.capacity - templateData.ticketsSold
    : null

  const handlePayment = () => {
    if (ticket) {
      onPayment(ticket.id, getPrice(ticket))
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: templateData.eventName || page.title,
          text: page.description || '',
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-lg mx-auto">
        {/* Event Image/Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-[16/9] bg-slate-800"
        >
          {page.logoUrl ? (
            <Image
              src={page.logoUrl}
              alt={page.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: page.primaryColor }}
            >
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-xl font-bold">{templateData.eventName || page.title}</p>
              </div>
            </div>
          )}

          {/* Share button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Event Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-t-3xl -mt-6 relative z-10"
        >
          <div className="p-6">
            {/* Event Title */}
            <h1 className="text-2xl font-bold text-slate-900">
              {templateData.eventName || page.title}
            </h1>

            {/* Date & Time */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${page.primaryColor}20` }}
                >
                  <Calendar
                    className="w-5 h-5"
                    style={{ color: page.primaryColor }}
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {formatDate(templateData.date)}
                  </p>
                  {templateData.time && (
                    <p className="text-sm text-slate-500">{templateData.time}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${page.primaryColor}20` }}
                >
                  <MapPin
                    className="w-5 h-5"
                    style={{ color: page.primaryColor }}
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {templateData.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {page.description && (
              <p className="mt-6 text-slate-600 leading-relaxed">
                {page.description}
              </p>
            )}

            {/* Tickets remaining */}
            {ticketsRemaining !== null && ticketsRemaining > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">
                    Plus que {ticketsRemaining} place{ticketsRemaining > 1 ? 's' : ''} disponible{ticketsRemaining > 1 ? 's' : ''} !
                  </span>
                </div>
              </div>
            )}

            {ticketsRemaining === 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 font-medium">
                Événement complet
              </div>
            )}

            {/* Ticket Options */}
            {page.services.length > 1 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">
                    Types de billets
                  </h3>
                  <span className="text-xs text-slate-400">Frais inclus</span>
                </div>
                <div className="space-y-2">
                  {page.services
                    .filter((s) => s.isActive)
                    .map((ticketType) => (
                      <button
                        key={ticketType.id}
                        onClick={() => onPayment(ticketType.id, getPrice(ticketType))}
                        className={cn(
                          'w-full p-4 rounded-xl border-2 text-left transition-all',
                          ticket?.id === ticketType.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                        style={
                          ticket?.id === ticketType.id
                            ? { borderColor: page.primaryColor }
                            : {}
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {ticketType.name}
                            </p>
                            {ticketType.description && (
                              <p className="text-sm text-slate-500 mt-1">
                                {ticketType.description}
                              </p>
                            )}
                          </div>
                          <span
                            className="font-bold text-lg"
                            style={{ color: page.primaryColor }}
                          >
                            {formatCurrency(getPrice(ticketType))}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Main CTA */}
            {ticket && ticketsRemaining !== 0 && (
              <>
                <Button
                  onClick={handlePayment}
                  isLoading={isLoading}
                  className="w-full mt-6 py-4 text-lg"
                  style={{ backgroundColor: page.primaryColor }}
                  leftIcon={<Ticket className="w-5 h-5" />}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Acheter • {formatCurrency(getPrice(ticket))}
                </Button>
                <p className="text-center text-xs text-slate-400 mt-2">
                  Frais de transfert inclus
                </p>
              </>
            )}

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 mt-4">
              Billet envoyé par SMS après paiement
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

