'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Wallet, Mail, Lock, Eye, EyeOff, User, Phone, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth'
import { isValidCameroonPhone } from '@/lib/utils'
import type { ApiError } from '@/types'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Minimum 2 caractères'),
    lastName: z.string().min(2, 'Minimum 2 caractères'),
    email: z.string().email('Email invalide'),
    phone: z.string().refine(isValidCameroonPhone, 'Numéro camerounais invalide'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, 'Vous devez accepter les conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      toast.success('Compte créé avec succès !')
      router.push('/dashboard')
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError.message || 'Erreur lors de la création du compte')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900">PayLink</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
            <p className="text-slate-600">Commencez à recevoir des paiements</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                placeholder="Jean"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Nom"
                placeholder="Dupont"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Téléphone"
              type="tel"
              placeholder="6 XX XX XX XX"
              leftIcon={<Phone className="w-5 h-5" />}
              hint="Numéro Orange Money ou MTN MoMo"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                {...register('acceptTerms')}
              />
              <span className="text-sm text-slate-600">
                J'accepte les{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Créer mon compte
            </Button>
          </form>

          {/* Avantages */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-3">Avec votre compte gratuit :</p>
            <ul className="space-y-2">
              {[
                'Créez 1 page de paiement',
                'Recevez des paiements Orange Money & MTN',
                'Tableau de bord complet',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          © {new Date().getFullYear()} PayLink. Tous droits réservés.
        </p>
      </motion.div>
    </div>
  )
}

