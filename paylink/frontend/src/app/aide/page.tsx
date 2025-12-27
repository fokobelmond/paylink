'use client'

import Link from 'next/link'
import { Wallet, ArrowLeft, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react'

const faqs = [
  {
    question: "Comment créer ma page de paiement ?",
    answer: "Inscrivez-vous gratuitement, choisissez un template adapté à votre activité, personnalisez-le avec vos informations et partagez le lien généré."
  },
  {
    question: "Quels sont les frais de transaction ?",
    answer: "Les frais varient selon votre forfait : 3% pour le plan gratuit, 2% pour Starter et 1.5% pour Pro. Ces frais incluent les frais Mobile Money."
  },
  {
    question: "Comment recevoir mes paiements ?",
    answer: "Les paiements sont envoyés directement sur votre compte Orange Money ou MTN MoMo. Aucun transit par PayLink."
  },
  {
    question: "Puis-je personnaliser ma page ?",
    answer: "Oui ! Vous pouvez modifier le titre, la description, les couleurs, ajouter votre logo et configurer vos services/produits."
  },
  {
    question: "Les paiements sont-ils sécurisés ?",
    answer: "Absolument. Nous utilisons les APIs officielles Orange Money et MTN MoMo. Toutes les transactions sont chiffrées et tracées."
  },
  {
    question: "Comment contacter le support ?",
    answer: "Vous pouvez nous joindre par WhatsApp au +237 6XX XXX XXX ou par email à support@paylink.cm"
  },
]

export default function AidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">PayLink</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Centre d'aide</h1>
          <p className="text-lg text-slate-600">
            Trouvez rapidement les réponses à vos questions
          </p>
        </div>

        {/* Contact rapide */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <a 
            href="https://wa.me/237600000000" 
            target="_blank"
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center hover:bg-green-100 transition"
          >
            <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">WhatsApp</h3>
            <p className="text-sm text-slate-600">Réponse rapide</p>
          </a>
          <a 
            href="mailto:support@paylink.cm"
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center hover:bg-blue-100 transition"
          >
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
            <p className="text-sm text-slate-600">support@paylink.cm</p>
          </a>
          <a 
            href="tel:+237600000000"
            className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center hover:bg-purple-100 transition"
          >
            <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Téléphone</h3>
            <p className="text-sm text-slate-600">+237 6XX XXX XXX</p>
          </a>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Questions fréquentes</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Vous n'avez pas trouvé votre réponse ?</p>
          <a 
            href="https://wa.me/237600000000"
            target="_blank"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            <MessageCircle className="w-5 h-5" />
            Contactez-nous sur WhatsApp
          </a>
        </div>
      </main>
    </div>
  )
}

