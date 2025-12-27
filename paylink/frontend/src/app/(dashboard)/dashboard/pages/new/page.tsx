'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Palette,
  FileText,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateSlug, cn } from '@/lib/utils'
import {
  TEMPLATE_LABELS,
  TEMPLATE_ICONS,
  type TemplateType,
} from '@/types'

const templates: { type: TemplateType; description: string }[] = [
  {
    type: 'SERVICE_PROVIDER',
    description: 'Freelances, coachs, réparateurs',
  },
  {
    type: 'SIMPLE_SALE',
    description: 'Vendeurs WhatsApp, produit unique',
  },
  {
    type: 'DONATION',
    description: 'Associations, ONG, collectes',
  },
  {
    type: 'TRAINING',
    description: 'Formateurs, écoles privées',
  },
  {
    type: 'EVENT',
    description: 'Concerts, conférences, ateliers',
  },
  {
    type: 'ASSOCIATION',
    description: 'Clubs, cotisations membres',
  },
]

const colors = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#059669', // Green
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#1f2937', // Dark
]

const pageSchema = z.object({
  title: z.string().min(2, 'Minimum 2 caractères').max(100),
  slug: z
    .string()
    .min(3, 'Minimum 3 caractères')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets uniquement'),
  description: z.string().max(500).optional(),
})

type PageFormData = z.infer<typeof pageSchema>

export default function NewPagePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
    },
  })

  const title = watch('title')

  // Générer le slug automatiquement depuis le titre
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setValue('title', newTitle)
    setValue('slug', generateSlug(newTitle))
  }

  const onSubmit = async (data: PageFormData) => {
    if (!selectedTemplate) {
      toast.error('Sélectionnez un template')
      return
    }

    setIsLoading(true)

    try {
      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Page créée avec succès !')
      router.push('/dashboard/pages')
    } catch (error) {
      toast.error('Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceedToStep2 = selectedTemplate !== null
  const canProceedToStep3 = title.length >= 2

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux pages
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Créer une nouvelle page</h1>
        <p className="text-slate-600 mt-1">
          Suivez les étapes pour créer votre page de paiement
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Template', icon: Sparkles },
          { num: 2, label: 'Informations', icon: FileText },
          { num: 3, label: 'Style', icon: Palette },
        ].map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition',
                step === s.num
                  ? 'bg-primary-100 text-primary-700'
                  : step > s.num
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              {step > s.num ? (
                <Check className="w-5 h-5" />
              ) : (
                <s.icon className="w-5 h-5" />
              )}
              <span className="font-medium hidden sm:inline">{s.label}</span>
              <span className="font-medium sm:hidden">{s.num}</span>
            </div>
            {index < 2 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-2',
                  step > s.num ? 'bg-green-300' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 sm:p-8"
      >
        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Choisissez un template
            </h2>
            <p className="text-slate-600 mb-6">
              Sélectionnez le type de page qui correspond à votre activité
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.type}
                  onClick={() => setSelectedTemplate(template.type)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    selectedTemplate === template.type
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{TEMPLATE_ICONS[template.type]}</span>
                    <div>
                      <p className="font-medium text-slate-900">
                        {TEMPLATE_LABELS[template.type]}
                      </p>
                      <p className="text-sm text-slate-500">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Page Information */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Informations de la page
            </h2>
            <p className="text-slate-600 mb-6">
              Donnez un nom et une description à votre page
            </p>

            <div className="space-y-5">
              <Input
                label="Titre de la page"
                placeholder="Ex: Ma Boutique, Marie Coiffure..."
                error={errors.title?.message}
                {...register('title')}
                onChange={handleTitleChange}
              />

              <div>
                <Input
                  label="URL de la page"
                  placeholder="ma-boutique"
                  error={errors.slug?.message}
                  {...register('slug')}
                />
                <p className="mt-1.5 text-sm text-slate-500">
                  paylink.cm/p/<span className="font-medium">{watch('slug') || 'mon-slug'}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description (optionnel)
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                  placeholder="Décrivez votre activité..."
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continuer
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Style */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Personnalisez le style
            </h2>
            <p className="text-slate-600 mb-6">
              Choisissez la couleur principale de votre page
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Couleur principale
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'w-12 h-12 rounded-xl transition-transform',
                      selectedColor === color && 'ring-2 ring-offset-2 scale-110'
                    )}
                    style={{
                      backgroundColor: color,
                      boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : undefined,
                    }}
                  >
                    {selectedColor === color && (
                      <Check className="w-5 h-5 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-3">Aperçu</p>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${selectedColor}20` }}
                  >
                    {selectedTemplate && TEMPLATE_ICONS[selectedTemplate]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {title || 'Titre de la page'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedTemplate && TEMPLATE_LABELS[selectedTemplate]}
                    </p>
                  </div>
                </div>
                <button
                  className="w-full py-2.5 rounded-lg text-white font-medium"
                  style={{ backgroundColor: selectedColor }}
                >
                  Bouton d'action
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                isLoading={isLoading}
                rightIcon={<Check className="w-4 h-4" />}
              >
                Créer la page
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

