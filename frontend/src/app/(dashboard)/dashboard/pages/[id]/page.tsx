'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  Plus,
  Settings,
  FileText,
  Palette,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn, generateSlug } from '@/lib/utils'
import { pagesApi } from '@/lib/api'
import { TEMPLATE_LABELS, TEMPLATE_ICONS } from '@/types'
import type { Page, Service } from '@/types'

const colors = [
  '#2563eb', '#dc2626', '#059669', '#7c3aed',
  '#ea580c', '#0891b2', '#be185d', '#1f2937',
]

const pageSchema = z.object({
  title: z.string().min(2, 'Minimum 2 caractères').max(100),
  slug: z.string().min(3, 'Minimum 3 caractères').max(50)
    .regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets uniquement'),
  description: z.string().max(500).optional(),
})

type PageFormData = z.infer<typeof pageSchema>

export default function EditPagePage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string

  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [activeTab, setActiveTab] = useState<'info' | 'style' | 'services'>('info')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
  })

  // Charger la page
  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true)
      try {
        const res = await pagesApi.get(pageId)
        if (res.success) {
          const pageData = res.data
          setPage(pageData)
          setValue('title', pageData.title)
          setValue('slug', pageData.slug)
          setValue('description', pageData.description || '')
          setSelectedColor(pageData.primaryColor || colors[0])
        } else {
          toast.error('Page non trouvée')
          router.push('/dashboard/pages')
        }
      } catch (error) {
        console.error('Failed to fetch page:', error)
        toast.error('Erreur lors du chargement')
        router.push('/dashboard/pages')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPage()
  }, [pageId, router, setValue])

  const onSubmit = async (data: PageFormData) => {
    setIsSaving(true)
    try {
      const res = await pagesApi.update(pageId, {
        title: data.title,
        slug: data.slug,
        description: data.description || undefined,
        primaryColor: selectedColor,
      })
      if (res.success) {
        toast.success('Page mise à jour avec succès')
        setPage(res.data)
      } else {
        toast.error(res.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur réseau')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.')) return
    
    try {
      const res = await pagesApi.delete(pageId)
      if (res.success) {
        toast.success('Page supprimée')
        router.push('/dashboard/pages')
      } else {
        toast.error(res.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur réseau')
    }
  }

  const handlePublish = async () => {
    if (!page) return
    const newStatus = page.status === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED'
    
    try {
      const res = await pagesApi.update(pageId, { status: newStatus })
      if (res.success) {
        setPage({ ...page, status: newStatus })
        toast.success(newStatus === 'PUBLISHED' ? 'Page publiée !' : 'Page mise en pause')
      } else {
        toast.error(res.message || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur réseau')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Page non trouvée</p>
        <Link href="/dashboard/pages" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour aux pages
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux pages
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              {TEMPLATE_ICONS[page.templateType]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
              <p className="text-slate-600">{TEMPLATE_LABELS[page.templateType]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {page.status === 'PUBLISHED' && (
              <Link href={`/p/${page.slug}`} target="_blank">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir
                </Button>
              </Link>
            )}
            <Button
              variant={page.status === 'PUBLISHED' ? 'secondary' : 'primary'}
              size="sm"
              onClick={handlePublish}
            >
              {page.status === 'PUBLISHED' ? 'Mettre en pause' : 'Publier'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
        {[
          { id: 'info', label: 'Informations', icon: FileText },
          { id: 'style', label: 'Style', icon: Palette },
          { id: 'services', label: 'Services', icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition',
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6"
      >
        {/* Tab: Informations */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Informations générales
              </h2>
              <div className="space-y-4">
                <Input
                  label="Titre de la page"
                  placeholder="Ex: Ma Boutique"
                  error={errors.title?.message}
                  {...register('title')}
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
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                    placeholder="Décrivez votre activité..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
              <Button type="submit" isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </form>
        )}

        {/* Tab: Style */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Personnalisation
              </h2>
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
            </div>

            {/* Preview */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-3">Aperçu</p>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${selectedColor}20` }}
                  >
                    {TEMPLATE_ICONS[page.templateType]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{watch('title') || page.title}</p>
                    <p className="text-sm text-slate-500">{TEMPLATE_LABELS[page.templateType]}</p>
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

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button onClick={handleSubmit(onSubmit)} isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer le style
              </Button>
            </div>
          </div>
        )}

        {/* Tab: Services */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Services & Produits
              </h2>
              <Link href={`/dashboard/pages/${pageId}/services/new`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </Link>
            </div>

            {page.services && page.services.length > 0 ? (
              <div className="space-y-3">
                {page.services.map((service: Service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{service.name}</p>
                      <p className="text-sm text-slate-500">
                        {service.price.toLocaleString()} FCFA
                      </p>
                    </div>
                    <Link href={`/dashboard/pages/${pageId}/services/${service.id}`}>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">Aucun service ou produit ajouté</p>
                <Link href={`/dashboard/pages/${pageId}/services/new`}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un service
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

