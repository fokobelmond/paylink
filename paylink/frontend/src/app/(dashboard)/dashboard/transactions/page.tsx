'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  formatCurrency,
  formatDateTime,
  formatRelativeDate,
  cn,
} from '@/lib/utils'
import {
  TRANSACTION_STATUS_COLORS,
  TRANSACTION_STATUS_LABELS,
  type Transaction,
  type TransactionStatus,
} from '@/types'

// Données mock avec nouveaux champs de frais
const mockTransactions: Transaction[] = [
  {
    id: '1',
    reference: 'PL-A7X3K9',
    pageId: 'page1',
    serviceId: 'service1',
    grossAmount: 15600,
    netAmount: 15000,
    providerFee: 234,
    platformFee: 366,
    amount: 15600,
    currency: 'XAF',
    payerPhone: '237655123456',
    payerName: 'Jean Kamga',
    payerEmail: 'jean@exemple.com',
    provider: 'ORANGE_MONEY',
    status: 'SUCCESS',
    providerReference: 'OM123456',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    paidAt: null,
  },
  {
    id: '4',
    reference: 'PL-D4K7P2',
    pageId: 'page1',
    serviceId: 'service2',
    grossAmount: 8300,
    netAmount: 8000,
    providerFee: 125,
    platformFee: 175,
    amount: 8300,
    currency: 'XAF',
    payerPhone: '237677888999',
    payerName: 'Alice Mbarga',
    payerEmail: 'alice@exemple.com',
    provider: 'MTN_MOMO',
    status: 'FAILED',
    providerReference: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    paidAt: null,
  },
  {
    id: '5',
    reference: 'PL-E1M9R6',
    pageId: 'page3',
    serviceId: null,
    grossAmount: 52000,
    netAmount: 50000,
    providerFee: 780,
    platformFee: 1220,
    amount: 52000,
    currency: 'XAF',
    payerPhone: '237650111222',
    payerName: 'Entreprise XYZ',
    payerEmail: 'contact@xyz.cm',
    provider: 'ORANGE_MONEY',
    status: 'SUCCESS',
    providerReference: 'OM987654',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

const statusFilters: { value: TransactionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'SUCCESS', label: 'Réussies' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'PROCESSING', label: 'En cours' },
  { value: 'FAILED', label: 'Échouées' },
]

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.payerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.payerPhone.includes(searchQuery)

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalSuccess = transactions.filter((tx) => tx.status === 'SUCCESS').length
  const totalRevenue = transactions
    .filter((tx) => tx.status === 'SUCCESS')
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">
            Historique de vos paiements reçus
          </p>
        </div>
        <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
          Exporter CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-soft">
          <p className="text-sm text-slate-500">Transactions réussies</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalSuccess}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-soft">
          <p className="text-sm text-slate-500">Revenus totaux</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-soft">
          <p className="text-sm text-slate-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {transactions.filter((tx) => tx.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-soft">
          <p className="text-sm text-slate-500">Taux de succès</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {transactions.length > 0
              ? Math.round((totalSuccess / transactions.length) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Rechercher par référence, nom ou téléphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          className="flex-1"
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition',
                statusFilter === filter.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Référence
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Payeur
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-4">
                    <span className="font-mono font-medium text-slate-900">
                      {tx.reference}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {tx.payerName || 'Non renseigné'}
                      </p>
                      <p className="text-sm text-slate-500">{tx.payerPhone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        tx.provider === 'ORANGE_MONEY'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          tx.provider === 'ORANGE_MONEY'
                            ? 'bg-orange-500'
                            : 'bg-yellow-500'
                        )}
                      />
                      {tx.provider === 'ORANGE_MONEY' ? 'Orange' : 'MTN'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                        TRANSACTION_STATUS_COLORS[tx.status]
                      )}
                    >
                      {TRANSACTION_STATUS_LABELS[tx.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    <span title={formatDateTime(tx.createdAt)}>
                      {formatRelativeDate(tx.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Aucune transaction trouvée</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} sur{' '}
              {filteredTransactions.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

