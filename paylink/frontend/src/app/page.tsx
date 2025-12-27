'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Wallet,
  Zap,
  Shield,
  Smartphone,
  Users,
  TrendingUp,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Ultra rapide',
    description: 'Créez votre page en moins de 2 minutes et commencez à recevoir des paiements.',
  },
  {
    icon: Shield,
    title: 'Sécurisé',
    description: 'Vos paiements sont protégés et tracés. Aucun risque de fraude.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first',
    description: 'Optimisé pour les smartphones. Vos clients paient en quelques clics.',
  },
  {
    icon: Wallet,
    title: 'Orange Money & MTN MoMo',
    description: 'Acceptez les deux principales solutions de paiement mobile au Cameroun.',
  },
]

const templates = [
  { name: 'Prestataire', icon: '🔧', description: 'Freelances, coachs, réparateurs' },
  { name: 'Vente simple', icon: '🛍️', description: 'Vendeurs WhatsApp' },
  { name: 'Don / ONG', icon: '❤️', description: 'Associations, collectes' },
  { name: 'Formation', icon: '📚', description: 'Écoles, formateurs' },
  { name: 'Événement', icon: '🎉', description: 'Concerts, conférences' },
  { name: 'Association', icon: '🤝', description: 'Clubs, cotisations' },
]

const testimonials = [
  {
    name: 'Marie K.',
    role: 'Coiffeuse à Douala',
    content: 'Mes clientes peuvent me payer directement sur ma page. Plus de problème de monnaie !',
    avatar: '👩🏾',
  },
  {
    name: 'Jean-Paul M.',
    role: 'Formateur indépendant',
    content: "J'ai doublé mes inscriptions depuis que j'utilise PayLink. C'est tellement simple !",
    avatar: '👨🏾‍🏫',
  },
  {
    name: 'ONG Espoir',
    role: 'Association caritative',
    content: 'Les dons arrivent directement. La traçabilité est parfaite pour nos rapports.',
    avatar: '🏢',
  },
]

const pricing = [
  {
    name: 'Gratuit',
    price: '0',
    description: 'Pour démarrer',
    features: ['1 page de paiement', "Jusqu'à 50 000 FCFA/mois", '3% par transaction', 'Support email'],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Starter',
    price: '5 000',
    description: 'Pour les professionnels',
    features: ['3 pages de paiement', 'Transactions illimitées', '2% par transaction', 'Support prioritaire', 'Statistiques avancées'],
    cta: 'Essayer 14 jours',
    popular: true,
  },
  {
    name: 'Pro',
    price: '15 000',
    description: 'Pour les entreprises',
    features: ['Pages illimitées', 'Transactions illimitées', '1.5% par transaction', 'Support téléphonique', 'API personnalisée', 'Multi-utilisateurs'],
    cta: 'Nous contacter',
    popular: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 z-50">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">PayLink</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition">
                Fonctionnalités
              </a>
              <a href="#templates" className="text-slate-600 hover:text-slate-900 transition">
                Templates
              </a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">
                Tarifs
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-ghost text-sm">
                Connexion
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                Plus de 1 000 utilisateurs au Cameroun
              </span>

              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Recevez des paiements
                <br />
                <span className="text-gradient">Mobile Money</span> facilement
              </h1>

              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                Créez votre page de paiement en 2 minutes. Partagez le lien. Recevez l'argent
                directement sur votre compte Orange Money ou MTN MoMo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                  Créer ma page gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#demo" className="btn-outline text-lg px-8 py-4 w-full sm:w-auto">
                  Voir une démo
                </Link>
              </div>
            </motion.div>

            {/* Providers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-12 flex items-center justify-center gap-8"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  OM
                </div>
                <span>Orange Money</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-bold">
                  M
                </div>
                <span>MTN MoMo</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-sm text-slate-500">
                    paylink.cm/p/marie-coiffure
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-b from-slate-50 to-white min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary-100 mx-auto mb-4 flex items-center justify-center text-4xl">
                      💇🏾‍♀️
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Marie Coiffure</h3>
                    <p className="text-slate-600 mb-6">Coiffure et soins capillaires à Douala</p>
                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                      <div className="bg-white rounded-lg p-4 border border-slate-200 flex justify-between items-center">
                        <span>Tresses simples</span>
                        <span className="font-bold text-primary-600">5 000 FCFA</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200 flex justify-between items-center">
                        <span>Tissage complet</span>
                        <span className="font-bold text-primary-600">15 000 FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi choisir PayLink ?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une solution pensée pour le marché camerounais, simple et fiable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-soft border border-slate-100"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Un template pour chaque usage
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choisissez le template adapté à votre activité et personnalisez-le.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-primary-600 transition">
                  {template.name}
                </h3>
                <p className="text-slate-600">{template.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              3 étapes simples pour commencer à recevoir des paiements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Créez votre compte',
                description: 'Inscrivez-vous gratuitement en 30 secondes avec votre numéro.',
              },
              {
                step: '2',
                title: 'Créez votre page',
                description: 'Choisissez un template, ajoutez vos infos et personnalisez.',
              },
              {
                step: '3',
                title: 'Partagez et recevez',
                description: 'Partagez votre lien sur WhatsApp, Facebook... et recevez vos paiements !',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-soft border border-slate-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Commencez gratuitement, évoluez selon vos besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? 'ring-2 ring-primary-500 shadow-xl relative'
                    : 'border border-slate-200 shadow-soft'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Populaire
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">FCFA/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-600">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block w-full text-center py-3 rounded-lg font-medium transition ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-app">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à recevoir des paiements ?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 1 000 entrepreneurs camerounais qui utilisent PayLink.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-primary-50 transition"
            >
              Créer mon compte gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container-app">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">PayLink</span>
              </div>
              <p className="text-sm">
                La solution simple pour recevoir des paiements Mobile Money au Cameroun.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#templates" className="hover:text-white transition">Templates</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Tarifs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} PayLink. Tous droits réservés. Made with ❤️ in Cameroon</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

