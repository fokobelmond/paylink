'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, MessageCircle, Plus, Minus, ShoppingCart, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, cn } from '@/lib/utils'
import type { PageTemplateProps } from './PageTemplate'
import type { ServiceProviderData, Service } from '@/types'

interface CartItem {
  service: Service
  quantity: number
}

/**
 * Template 1: Prestataire de services
 * Usage: freelance, coach, réparateur
 * Affiche une liste de services avec système de panier
 * 
 * UX CLIENT: Le prix affiché inclut tous les frais (transparent)
 * Aucun détail des frais n'est montré - juste "frais inclus"
 */
export function ServiceProviderTemplate({ page, onPayment, isLoading }: PageTemplateProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const templateData = page.templateData as ServiceProviderData

  // Calculer le total du panier (utilise displayPrice = prix avec frais)
  // Fallback sur price pour compatibilité avec anciennes données
  const getServicePrice = (service: Service) => service.displayPrice || service.price
  const cartTotal = cart.reduce((total, item) => total + getServicePrice(item.service) * item.quantity, 0)
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0)

  // Ajouter un service au panier
  const addToCart = (service: Service) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === service.id)
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { service, quantity: 1 }]
    })
  }

  // Retirer une unité du panier
  const removeFromCart = (serviceId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === serviceId)
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.service.id === serviceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prev.filter((item) => item.service.id !== serviceId)
    })
  }

  // Supprimer complètement un service du panier
  const deleteFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.service.id !== serviceId))
  }

  // Obtenir la quantité d'un service dans le panier
  const getQuantity = (serviceId: string): number => {
    const item = cart.find((item) => item.service.id === serviceId)
    return item?.quantity || 0
  }

  // Payer le panier
  const handlePayment = () => {
    if (cart.length > 0) {
      // Envoyer le premier service avec le total (pour simplifier)
      // En production, on enverrait tout le panier
      onPayment(cart[0].service.id, cartTotal)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec couleur principale - Plus grand pour bien voir */}
      <div
        className="h-44 sm:h-52"
        style={{ backgroundColor: page.primaryColor }}
      />

      <div className="container-app pb-32">
        {/* Profile Card - Repositionnée pour être bien visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden -mt-20"
        >
          {/* Profile Header */}
          <div className="relative px-6 pt-8 pb-6">
            {/* Logo/Avatar - Centré et bien visible */}
            <div className="flex flex-col items-center text-center">
              {page.logoUrl ? (
                <Image
                  src={page.logoUrl}
                  alt={page.title}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover mb-4"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-5xl bg-white mb-4"
                >
                  🔧
                </div>
              )}

              <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
              
              {templateData.profession && (
                <p className="text-slate-600 mt-1">{templateData.profession}</p>
              )}

              {page.description && (
                <p className="text-slate-500 mt-3 max-w-md">
                  {page.description}
                </p>
              )}

              {/* Info badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                {templateData.location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    {templateData.location}
                  </span>
                )}
                {templateData.whatsapp && (
                  <a
                    href={`https://wa.me/${templateData.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full text-sm text-green-700 hover:bg-green-200 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Nos services
            </h2>

            <div className="space-y-3">
              {page.services
                .filter((s) => s.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((service, index) => {
                  const quantity = getQuantity(service.id)
                  
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        quantity > 0
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 bg-white'
                      )}
                      style={quantity > 0 ? { borderColor: page.primaryColor, backgroundColor: `${page.primaryColor}10` } : {}}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">
                            {service.name}
                          </p>
                          {service.description && (
                            <p className="text-sm text-slate-500 mt-0.5">
                              {service.description}
                            </p>
                          )}
                          <div className="mt-1">
                            <p
                              className="font-bold text-lg inline"
                              style={{ color: page.primaryColor }}
                            >
                              {formatCurrency(getServicePrice(service))}
                            </p>
                            <span className="text-xs text-slate-400 ml-1">
                              frais inclus
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          {quantity > 0 ? (
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                              <button
                                onClick={() => removeFromCart(service.id)}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-semibold text-slate-900">
                                {quantity}
                              </span>
                              <button
                                onClick={() => addToCart(service)}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-white transition"
                                style={{ backgroundColor: page.primaryColor }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(service)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
                              style={{ backgroundColor: page.primaryColor }}
                            >
                              <Plus className="w-4 h-4" />
                              Ajouter
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </div>

            {page.services.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Aucun service disponible
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Paiement sécurisé via PayLink
        </p>
      </div>

      {/* Fixed Cart Bar */}
      <AnimatePresence>
        {cartItemsCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50"
          >
            <div className="container-app py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Cart Summary */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-3"
                >
                  <div
                    className="relative w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${page.primaryColor}15` }}
                  >
                    <ShoppingCart className="w-6 h-6" style={{ color: page.primaryColor }} />
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: page.primaryColor }}
                    >
                      {cartItemsCount}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-slate-500">Votre panier</p>
                    <p className="font-bold text-slate-900">{formatCurrency(cartTotal)}</p>
                  </div>
                </button>

                {/* Pay Button */}
                <Button
                  onClick={handlePayment}
                  isLoading={isLoading}
                  className="px-8 py-3 text-lg"
                  style={{ backgroundColor: page.primaryColor }}
                >
                  Payer {formatCurrency(cartTotal)}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" style={{ color: page.primaryColor }} />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Votre panier ({cartItemsCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map((item) => {
                  const itemPrice = getServicePrice(item.service)
                  return (
                  <div
                    key={item.service.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{item.service.name}</p>
                      <p className="text-sm" style={{ color: page.primaryColor }}>
                        {formatCurrency(itemPrice)} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(itemPrice * item.quantity)}
                      </p>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeFromCart(item.service.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.service)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white transition"
                          style={{ backgroundColor: page.primaryColor }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => deleteFromCart(item.service.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg text-slate-600">Total</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                {/* Message discret - frais inclus */}
                <p className="text-xs text-slate-400 text-right mb-4">
                  Frais de transaction inclus
                </p>
                <Button
                  onClick={() => {
                    setIsCartOpen(false)
                    handlePayment()
                  }}
                  isLoading={isLoading}
                  className="w-full py-4 text-lg"
                  style={{ backgroundColor: page.primaryColor }}
                >
                  Payer {formatCurrency(cartTotal)}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
