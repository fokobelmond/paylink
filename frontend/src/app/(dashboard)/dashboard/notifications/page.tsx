'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRelativeDate } from '@/lib/utils'
import { useNotificationStore } from '@/store/notifications'

interface Notification {
  id: string
  type: 'payment' | 'page' | 'system' | 'promo'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link?: string
}

// Types d'icônes pour les notifications
const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'payment':
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    case 'page':
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )
    case 'promo':
      return (
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      )
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { setUnreadCount } = useNotificationStore()

  useEffect(() => {
    // Simuler le chargement des notifications
    // TODO: Remplacer par un appel API réel quand le backend sera prêt
    const loadNotifications = async () => {
      setIsLoading(true)
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Données de démonstration
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'payment',
          title: 'Paiement reçu',
          message: 'Vous avez reçu un paiement de 5 000 FCFA pour "Tresses simples"',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          link: '/dashboard/transactions'
        },
        {
          id: '2',
          type: 'page',
          title: 'Page publiée',
          message: 'Votre page "Ma Première Page" est maintenant en ligne',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
          link: '/dashboard/pages'
        },
        {
          id: '3',
          type: 'system',
          title: 'Bienvenue sur PayLink !',
          message: 'Créez votre première page de paiement et commencez à recevoir de l\'argent',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: '4',
          type: 'promo',
          title: 'Offre spéciale',
          message: 'Passez au plan Pro et bénéficiez de -20% pendant 3 mois',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        },
      ]
      
      setNotifications(demoNotifications)
      setIsLoading(false)
    }

    loadNotifications()
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      const newUnreadCount = updated.filter(n => !n.isRead).length
      setUnreadCount(newUnreadCount)
      return updated
    })
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const toDelete = prev.find(n => n.id === id)
      const updated = prev.filter(n => n.id !== id)
      if (toDelete && !toDelete.isRead) {
        setUnreadCount(updated.filter(n => !n.isRead).length)
      }
      return updated
    })
  }

  const deleteAllNotifications = () => {
    if (confirm('Supprimer toutes les notifications ?')) {
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes les notifications sont lues'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tout marquer comme lu
            </button>
          )}
          
          {notifications.length > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Tout supprimer
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Non lues ({unreadCount})
        </button>
      </div>

      {/* Liste des notifications */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </h3>
          <p className="text-slate-500">
            {filter === 'unread' 
              ? 'Vous êtes à jour !'
              : 'Vos notifications apparaîtront ici'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`bg-white rounded-xl p-4 border transition hover:shadow-md ${
                  notification.isRead 
                    ? 'border-slate-100' 
                    : 'border-primary-200 bg-primary-50/30'
                }`}
              >
                <div className="flex gap-4">
                  <NotificationIcon type={notification.type} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-medium ${
                          notification.isRead ? 'text-slate-700' : 'text-slate-900'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400">
                        {formatRelativeDate(notification.createdAt)}
                      </span>
                      
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Marquer comme lu
                          </button>
                        )}
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                          >
                            Voir →
                          </a>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-500">
          💡 Les notifications de paiement sont envoyées par SMS au numéro associé à votre compte.
        </p>
      </div>
    </div>
  )
}

