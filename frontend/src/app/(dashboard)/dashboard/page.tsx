'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  FileText,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatRelativeDate, copyToClipboard, cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { dashboardApi, pagesApi } from '@/lib/api'
import { TRANSACTION_STATUS_COLORS, TRANSACTION_STATUS_LABELS } from '@/types'
import type { DashboardStats, Transaction, Page, ApiError } from '@/types'

// Données de démonstration (fallback)
const defaultStats: DashboardStats = {
  totalPages: 0,
  totalTransactions: 0,
  totalRevenue: 0,
  pendingTransactions: 0,
  recentTransactions: [],
  revenueByDay: [],
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [pages, setPages] = useState<Page[]>([])
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        // Charger les stats du dashboard
        const statsResponse = await dashboardApi.getStats()
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      } catch (error) {
        console.log('Erreur chargement stats:', (error as ApiError).message)
        // Garder les stats par défaut
      }

      try {
        // Charger les pages de l'utilisateur
        const pagesResponse = await pagesApi.list(1, 5)
        if (pagesResponse.success && pagesResponse.data) {
          setPages(pagesResponse.data.data || [])
        }
      } catch (error) {
        console.log('Erreur chargement pages:', (error as ApiError).message)
        // Garder les pages vides
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`
    const success = await copyToClipboard(url)
    if (success) {
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(null), 2000)
    }
  }

  const statsCards = [
    {
      title: 'Revenus totaux',
      value: formatCurrency(stats.totalRevenue),
      change: '+12%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions.toString(),
      change: '+8',
      changeType: 'positive' as const,
      icon: Receipt,
    },
    {
      title: 'Pages actives',
      value: stats.totalPages.toString(),
      change: null,
      changeType: 'neutral' as const,
      icon: FileText,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
        <Link href="/dashboard/pages/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Créer une page
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
              {stat.change && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-200 shadow-soft"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              Transactions récentes
            </h2>
            <Link
              href="/dashboard/transactions"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                        tx.provider === 'ORANGE_MONEY'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      {tx.provider === 'ORANGE_MONEY' ? 'OM' : 'M'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {tx.payerName || tx.payerPhone}
                      </p>
                      <p className="text-sm text-slate-500">{tx.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(tx.amount)}
                    </p>
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                        TRANSACTION_STATUS_COLORS[tx.status]
                      )}
                    >
                      {TRANSACTION_STATUS_LABELS[tx.status]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stats.recentTransactions.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Aucune transaction pour le moment
            </div>
          )}
        </motion.div>

        {/* My Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 shadow-soft"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Mes pages</h2>
            <Link
              href="/dashboard/pages"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir tout
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {pages.map((page) => (
              <div key={page.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${page.primaryColor}20` }}
                    >
                      <span className="text-lg">
                        {page.templateType === 'SERVICE_PROVIDER' && '🔧'}
                        {page.templateType === 'SIMPLE_SALE' && '🛍️'}
                        {page.templateType === 'DONATION' && '❤️'}
                        {page.templateType === 'TRAINING' && '📚'}
                        {page.templateType === 'EVENT' && '🎉'}
                        {page.templateType === 'ASSOCIATION' && '🤝'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{page.title}</p>
                      <p className="text-sm text-slate-500">
                        paylink.cm/p/{page.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        page.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : page.status === 'DRAFT'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      {page.status === 'PUBLISHED'
                        ? 'Publié'
                        : page.status === 'DRAFT'
                        ? 'Brouillon'
                        : 'En pause'}
                    </span>
                    <button
                      onClick={() => handleCopyLink(page.slug)}
                      className="p-2 text-slate-400 hover:text-slate-600 transition"
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
                        className="p-2 text-slate-400 hover:text-slate-600 transition"
                        title="Voir la page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pages.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-slate-500 mb-4">
                Vous n'avez pas encore créé de page
              </p>
              <Link href="/dashboard/pages/new">
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Créer ma première page
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              💡 Astuce : Partagez votre lien partout !
            </h3>
            <p className="text-primary-100">
              Plus vous partagez votre page sur WhatsApp, Facebook et Instagram,
              plus vous recevez de paiements.
            </p>
          </div>
          <Link
            href="/dashboard/pages"
            className="shrink-0 bg-white text-primary-600 px-6 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition"
          >
            Voir mes pages
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

