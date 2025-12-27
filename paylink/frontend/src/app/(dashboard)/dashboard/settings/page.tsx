'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  User,
  Lock,
  CreditCard,
  Bell,
  Shield,
  ChevronRight,
  Check,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(9, 'Numéro invalide'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Minimum 6 caractères'),
    newPassword: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Sécurité', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'subscription', label: 'Abonnement', icon: CreditCard },
]

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Profil mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Mot de passe mis à jour')
      passwordForm.reset()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <nav className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">
                  Informations du profil
                </h2>

                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Prénom"
                      error={profileForm.formState.errors.firstName?.message}
                      {...profileForm.register('firstName')}
                    />
                    <Input
                      label="Nom"
                      error={profileForm.formState.errors.lastName?.message}
                      {...profileForm.register('lastName')}
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    error={profileForm.formState.errors.email?.message}
                    {...profileForm.register('email')}
                  />

                  <Input
                    label="Téléphone"
                    type="tel"
                    error={profileForm.formState.errors.phone?.message}
                    {...profileForm.register('phone')}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isProfileLoading}>
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">
                    Changer le mot de passe
                  </h2>

                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-5"
                  >
                    <Input
                      label="Mot de passe actuel"
                      type="password"
                      error={passwordForm.formState.errors.currentPassword?.message}
                      {...passwordForm.register('currentPassword')}
                    />

                    <Input
                      label="Nouveau mot de passe"
                      type="password"
                      error={passwordForm.formState.errors.newPassword?.message}
                      {...passwordForm.register('newPassword')}
                    />

                    <Input
                      label="Confirmer le nouveau mot de passe"
                      type="password"
                      error={passwordForm.formState.errors.confirmPassword?.message}
                      {...passwordForm.register('confirmPassword')}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" isLoading={isPasswordLoading}>
                        Mettre à jour
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Authentification à deux facteurs
                        </h3>
                        <p className="text-sm text-slate-500">
                          Ajoutez une couche de sécurité supplémentaire
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Activer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">
                  Préférences de notification
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Paiement reçu',
                      description: 'Notification à chaque paiement reçu',
                      sms: true,
                      email: true,
                    },
                    {
                      title: 'Paiement en attente',
                      description: 'Rappel pour les paiements non finalisés',
                      sms: false,
                      email: true,
                    },
                    {
                      title: 'Rapport hebdomadaire',
                      description: 'Résumé de vos transactions de la semaine',
                      sms: false,
                      email: true,
                    },
                    {
                      title: 'Nouvelles fonctionnalités',
                      description: 'Informations sur les mises à jour PayLink',
                      sms: false,
                      email: false,
                    },
                  ].map((notification) => (
                    <div
                      key={notification.title}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={notification.sms}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-slate-600">SMS</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={notification.email}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-slate-600">Email</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button>Enregistrer les préférences</Button>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">
                    Votre abonnement
                  </h2>

                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm text-primary-600 font-medium">
                          Plan actuel
                        </span>
                        <h3 className="text-2xl font-bold text-slate-900">
                          Gratuit
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        Actif
                      </span>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />1 page de
                        paiement
                      </li>
                      <li className="flex items-center gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        Jusqu'à 50 000 FCFA/mois
                      </li>
                      <li className="flex items-center gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />3% par
                        transaction
                      </li>
                    </ul>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-4">
                    Passer à un plan supérieur
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 hover:border-primary-300 transition cursor-pointer">
                      <h4 className="font-semibold text-slate-900">Starter</h4>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        5 000 <span className="text-sm font-normal">FCFA/mois</span>
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-slate-600">
                        <li>• 3 pages de paiement</li>
                        <li>• Transactions illimitées</li>
                        <li>• 2% par transaction</li>
                      </ul>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        Choisir
                      </Button>
                    </div>

                    <div className="border-2 border-primary-500 rounded-xl p-4 relative">
                      <span className="absolute -top-3 left-4 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Populaire
                      </span>
                      <h4 className="font-semibold text-slate-900">Pro</h4>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        15 000{' '}
                        <span className="text-sm font-normal">FCFA/mois</span>
                      </p>
                      <ul className="mt-3 space-y-1 text-sm text-slate-600">
                        <li>• Pages illimitées</li>
                        <li>• Transactions illimitées</li>
                        <li>• 1.5% par transaction</li>
                      </ul>
                      <Button className="w-full mt-4" size="sm">
                        Choisir
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Historique de facturation
                  </h3>
                  <div className="text-center py-8 text-slate-500">
                    Aucune facture pour le moment
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

