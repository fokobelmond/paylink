'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Check,
  Eye,
  Pause,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatRelativeDate, copyToClipboard, cn } from '@/lib/utils'
import { TEMPLATE_ICONS, TEMPLATE_LABELS } from '@/types'
import type { Page } from '@/types'

// Données mock
const mockPages: Page[] = [
  {
    id: 'page1',
    slug: 'marie-coiffure',
    userId: 'user1',
    templateType: 'SERVICE_PROVIDER',
    status: 'PUBLISHED',
    title: 'Marie Coiffure',
    description: 'Coiffure et soins capillaires à Douala',
    logoUrl: null,
    primaryColor: '#2563eb',
    templateData: { type: 'SERVICE_PROVIDER' },
    viewCount: 234,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    publishedAt: '2024-01-15T12:00:00Z',
    services: [],
  },
  {
    id: 'page2',
    slug: 'formation-excel',
    userId: 'user1',
    templateType: 'TRAINING',
    status: 'DRAFT',
    title: 'Formation Excel Pro',
    description: 'Maîtrisez Excel en 5 jours',
    logoUrl: null,
    primaryColor: '#059669',
    templateData: { type: 'TRAINING', trainingName: 'Excel Pro' },
    viewCount: 0,
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    publishedAt: null,
    services: [],
  },
  {
    id: 'page3',
    slug: 'ong-espoir',
    userId: 'user1',
    templateType: 'DONATION',
    status: 'PUBLISHED',
    title: 'ONG Espoir Cameroun',
    description: 'Aidez-nous à construire des écoles',
    logoUrl: null,
    primaryColor: '#dc2626',
    templateData: { type: 'DONATION', cause: 'Éducation' },
    viewCount: 567,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
    publishedAt: '2024-01-10T09:00:00Z',
    services: [],
  },
]

export default function PagesListPage() {
  const [pages] = useState<Page[]>(mockPages)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`
    const success = await copyToClipboard(url)
    if (success) {
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Publiée
          </span>
        )
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Brouillon
          </span>
        )
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            En pause
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes pages</h1>
          <p className="text-slate-600 mt-1">
            Gérez vos pages de paiement
          </p>
        </div>
        <Link href="/dashboard/pages/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Créer une page
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Rechercher une page..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          className="max-w-md"
        />
      </div>

      {/* Pages Grid */}
      {filteredPages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden hover:shadow-card transition-shadow"
            >
              {/* Card Header */}
              <div
                className="h-24 flex items-center justify-center"
                style={{ backgroundColor: `${page.primaryColor}15` }}
              >
                <span className="text-5xl">{TEMPLATE_ICONS[page.templateType]}</span>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{page.title}</h3>
                    <p className="text-sm text-slate-500">
                      {TEMPLATE_LABELS[page.templateType]}
                    </p>
                  </div>
                  {getStatusBadge(page.status)}
                </div>

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {page.description || 'Aucune description'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {page.viewCount} vues
                  </span>
                  <span>Modifié {formatRelativeDate(page.updatedAt)}</span>
                </div>

                {/* URL */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg mb-4">
                  <span className="text-sm text-slate-600 truncate flex-1">
                    paylink.cm/p/{page.slug}
                  </span>
                  <button
                    onClick={() => handleCopyLink(page.slug)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 transition"
                    title="Copier le lien"
                  >
                    {copiedSlug === page.slug ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  {page.status === 'PUBLISHED' && (
                    <Link
                      href={`/p/${page.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition"
                      title="Voir la page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/pages/${page.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Button>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === page.id ? null : page.id)
                      }
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === page.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                          {page.status === 'PUBLISHED' ? (
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <Pause className="w-4 h-4" />
                              Mettre en pause
                            </button>
                          ) : (
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <Play className="w-4 h-4" />
                              Publier
                            </button>
                          )}
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery ? 'Aucun résultat' : 'Aucune page créée'}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery
              ? 'Essayez une autre recherche'
              : 'Créez votre première page de paiement'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/pages/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Créer ma première page
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

