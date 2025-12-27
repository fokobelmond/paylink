'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle, ShoppingBag, Shield, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { PageTemplateProps } from './PageTemplate'
import type { SimpleSaleData } from '@/types'

/**
 * Template 2: Vente simple
 * Usage: vendeur WhatsApp, produit unique
 * Affiche un produit avec son prix et un bouton d'achat direct
 * 
 * UX CLIENT: Prix tout compris (frais inclus) - transparent pour l'acheteur
 */
export function SimpleSaleTemplate({ page, onPayment, isLoading }: PageTemplateProps) {
  const templateData = page.templateData as SimpleSaleData
  
  // Pour la vente simple, on prend le premier service actif comme produit
  const product = page.services.find((s) => s.isActive)

  // Utilise displayPrice (frais inclus) ou fallback sur price
  const getPrice = (service: typeof product) => service?.displayPrice || service?.price || 0

  const handlePayment = () => {
    if (product) {
      onPayment(product.id, getPrice(product))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-square bg-slate-100"
        >
          {templateData.productImage ? (
            <Image
              src={templateData.productImage}
              alt={templateData.productName || page.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-24 h-24 text-slate-300" />
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6"
        >
          <h1 className="text-2xl font-bold text-slate-900">
            {templateData.productName || page.title}
          </h1>

          {product && (
            <div className="mt-2">
              <p
                className="text-3xl font-bold inline"
                style={{ color: page.primaryColor }}
              >
                {formatCurrency(getPrice(product))}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Frais de transfert inclus
              </p>
            </div>
          )}

          {page.description && (
            <p className="text-slate-600 mt-4 leading-relaxed">
              {page.description}
            </p>
          )}

          {product?.description && (
            <p className="text-slate-500 mt-3">
              {product.description}
            </p>
          )}

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-6 py-4 border-y border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-5 h-5 text-green-500" />
              Paiement sécurisé
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Truck className="w-5 h-5 text-blue-500" />
              Livraison rapide
            </div>
          </div>

          {/* WhatsApp contact */}
          {templateData.whatsapp && (
            <a
              href={`https://wa.me/${templateData.whatsapp}?text=Bonjour, je suis intéressé par ${templateData.productName || page.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              <MessageCircle className="w-5 h-5" />
              Contacter sur WhatsApp
            </a>
          )}

          {/* Payment Button */}
          {product && (
            <Button
              onClick={handlePayment}
              isLoading={isLoading}
              className="w-full mt-4 py-4 text-lg"
              style={{ backgroundColor: page.primaryColor }}
            >
              Acheter maintenant • {formatCurrency(getPrice(product))}
            </Button>
          )}

          {!product && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-yellow-700">
              Produit temporairement indisponible
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <p className="text-center text-sm text-slate-400">
            Paiement sécurisé via PayLink
          </p>
        </div>
      </div>
    </div>
  )
}

