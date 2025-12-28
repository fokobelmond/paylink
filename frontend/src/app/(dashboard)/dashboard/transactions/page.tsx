'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
import { transactionsApi } from '@/lib/api'
import { toast } from 'sonner'

const statusFilters: { value: TransactionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'SUCCESS', label: 'Réussies' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'PROCESSING', label: 'En cours' },
  { value: 'FAILED', label: 'Échouées' },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Charger les transactions depuis le backend
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const res = await transactionsApi.list(currentPage, itemsPerPage)
        if (res.success) {
          setTransactions(res.data.data)
          setTotalItems(res.data.total)
        } else {
          toast.error('Erreur lors du chargement des transactions')
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
        toast.error('Erreur réseau')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTransactions()
  }, [currentPage])

  // Filtrage local (recherche et statut)
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.payerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.payerPhone.includes(searchQuery)

    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const totalSuccess = transactions.filter((tx) => tx.status === 'SUCCESS').length
  const totalRevenue = transactions
    .filter((tx) => tx.status === 'SUCCESS')
    .reduce((sum, tx) => sum + (tx.grossAmount || tx.amount), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

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
              {filteredTransactions.map((tx) => (
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
              {Math.min(currentPage * itemsPerPage, totalItems)} sur{' '}
              {totalItems}
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

