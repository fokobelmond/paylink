'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, Save, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { servicesApi } from '@/lib/api'
import { cn } from '@/lib/utils'

const serviceSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().min(100, 'Minimum 100 FCFA'),
  duration: z.coerce.number().min(1).optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

const pricingModes = [
  { value: 'NET_AMOUNT', label: 'Le client paie les frais', description: 'Vous recevez le montant exact affiché' },
  { value: 'FIXED_PRICE', label: 'Frais inclus dans le prix', description: 'Le client paie exactement le prix affiché' },
]

export default function NewServicePage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [pricingMode, setPricingMode] = useState<'NET_AMOUNT' | 'FIXED_PRICE'>('NET_AMOUNT')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 1000,
      duration: undefined,
    },
  })

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true)
    try {
      const res = await servicesApi.create(pageId, {
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        duration: data.duration || undefined,
        pricingMode,
        isActive: true,
      })
      if (res.success) {
        toast.success('Service créé avec succès')
        router.push(`/dashboard/pages/${pageId}`)
      } else {
        toast.error(res.message || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/pages/${pageId}`}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la page
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nouveau service</h1>
            <p className="text-slate-600">Ajoutez un service ou produit à votre page</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nom du service"
            placeholder="Ex: Coupe homme, Formation Excel..."
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description (optionnel)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
              placeholder="Décrivez ce service..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Prix (FCFA)"
              type="number"
              placeholder="1000"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Durée en minutes (optionnel)"
              type="number"
              placeholder="30"
              error={errors.duration?.message}
              {...register('duration')}
            />
          </div>

          {/* Pricing Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Mode de tarification
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {pricingModes.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setPricingMode(mode.value as typeof pricingMode)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    pricingMode === mode.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <p className="font-medium text-slate-900">{mode.label}</p>
                  <p className="text-sm text-slate-500 mt-1">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href={`/dashboard/pages/${pageId}`}>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Créer le service
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

