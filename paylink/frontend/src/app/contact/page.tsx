'use client'

import Link from 'next/link'
import { Wallet, ArrowLeft, MessageCircle, Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Contactez-nous</h1>
          <p className="text-lg text-slate-600">
            Notre équipe est disponible pour vous aider
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Infos de contact */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Nos coordonnées</h2>
              
              <div className="space-y-4">
                <a 
                  href="https://wa.me/237600000000"
                  target="_blank"
                  className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">WhatsApp</h3>
                    <p className="text-green-600">+237 6XX XXX XXX</p>
                  </div>
                </a>

                <a 
                  href="mailto:support@paylink.cm"
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email</h3>
                    <p className="text-blue-600">support@paylink.cm</p>
                  </div>
                </a>

                <a 
                  href="tel:+237600000000"
                  className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Téléphone</h3>
                    <p className="text-purple-600">+237 6XX XXX XXX</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Horaires de disponibilité</h3>
              </div>
              <p className="text-slate-600">
                Lundi - Vendredi : 8h00 - 18h00<br />
                Samedi : 9h00 - 14h00<br />
                Dimanche : Fermé
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Localisation</h3>
              </div>
              <p className="text-slate-600">
                Douala, Cameroun<br />
                Akwa, Boulevard de la Liberté
              </p>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Envoyez-nous un message</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom complet
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email ou Téléphone
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="email@exemple.com ou 6XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sujet
                </label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                  <option>Question générale</option>
                  <option>Problème technique</option>
                  <option>Paiement / Transaction</option>
                  <option>Partenariat</option>
                  <option>Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                  placeholder="Décrivez votre demande..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Envoyer le message
              </button>
            </form>

            <p className="text-sm text-slate-500 text-center mt-4">
              Nous vous répondrons dans les 24 heures
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

