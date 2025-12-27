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
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatRelativeDate, copyToClipboard, cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { TRANSACTION_STATUS_COLORS, TRANSACTION_STATUS_LABELS } from '@/types'
import type { DashboardStats, Transaction, Page } from '@/types'

// Données mock pour la démo
const mockStats: DashboardStats = {
  totalPages: 2,
  totalTransactions: 47,
  totalRevenue: 485000,
  pendingTransactions: 3,
  recentTransactions: [
    {
      id: '1',
      reference: 'PL-A7X3K9',
      pageId: 'page1',
      serviceId: 'service1',
      grossAmount: 15600,    // Ce que le client a payé
      netAmount: 15000,      // Ce que le vendeur reçoit
      providerFee: 234,      // Frais Orange (1.5%)
      platformFee: 366,      // Marge PayLink (2%)
      amount: 15600,         // Legacy
      currency: 'XAF',
      payerPhone: '237655123456',
      payerName: 'Jean Kamga',
      payerEmail: null,
      provider: 'ORANGE_MONEY',
      status: 'SUCCESS',
      providerReference: 'OM123456',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      paidAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
    },
    {
      id: '2',
      reference: 'PL-B2Y8M5',
      pageId: 'page1',
      serviceId: null,
      grossAmount: 5200,
      netAmount: 5000,
      providerFee: 78,
      platformFee: 122,
      amount: 5200,
      currency: 'XAF',
      payerPhone: '237670987654',
      payerName: 'Marie Fouda',
      payerEmail: null,
      provider: 'MTN_MOMO',
      status: 'SUCCESS',
      providerReference: 'MTN789012',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      reference: 'PL-C9Z1N4',
      pageId: 'page2',
      serviceId: null,
      grossAmount: 26000,
      netAmount: 25000,
      providerFee: 390,
      platformFee: 610,
      amount: 26000,
      currency: 'XAF',
      payerPhone: '237699111222',
      payerName: 'Paul Ndjock',
      payerEmail: null,
      provider: 'ORANGE_MONEY',
      status: 'PENDING',
      providerReference: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
      paidAt: null,
    },
  ],
  revenueByDay: [
    { date: '2024-01-20', amount: 45000 },
    { date: '2024-01-21', amount: 78000 },
    { date: '2024-01-22', amount: 62000 },
    { date: '2024-01-23', amount: 95000 },
    { date: '2024-01-24', amount: 43000 },
    { date: '2024-01-25', amount: 87000 },
    { date: '2024-01-26', amount: 75000 },
  ],
}

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
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats] = useState<DashboardStats>(mockStats)
  const [pages] = useState<Page[]>(mockPages)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

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

