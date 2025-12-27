'use client'

import Link from 'next/link'
import { Wallet, ArrowLeft } from 'lucide-react'

export default function ConditionsPage() {
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-slate-500 mb-8">Dernière mise à jour : Décembre 2024</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Objet</h2>
            <p className="text-slate-600 mb-4">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme PayLink, 
              un service de création de pages de paiement Mobile Money destiné aux professionnels, associations et 
              particuliers au Cameroun.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Définitions</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>PayLink</strong> : La plateforme et les services associés</li>
              <li><strong>Utilisateur</strong> : Toute personne utilisant la plateforme</li>
              <li><strong>Vendeur</strong> : Utilisateur créant une page de paiement</li>
              <li><strong>Client</strong> : Personne effectuant un paiement via une page PayLink</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Inscription et Compte</h2>
            <p className="text-slate-600 mb-4">
              Pour utiliser PayLink, vous devez créer un compte en fournissant des informations exactes et à jour. 
              Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les 
              activités effectuées sous votre compte.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Services Proposés</h2>
            <p className="text-slate-600 mb-4">
              PayLink permet de :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Créer des pages de paiement personnalisées</li>
              <li>Recevoir des paiements via Orange Money et MTN MoMo</li>
              <li>Suivre les transactions et statistiques</li>
              <li>Gérer plusieurs pages de paiement (selon forfait)</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Tarification et Frais</h2>
            <p className="text-slate-600 mb-4">
              Les frais de transaction varient selon le forfait choisi. Tous les frais sont clairement indiqués 
              avant chaque transaction. PayLink se réserve le droit de modifier les tarifs avec un préavis de 30 jours.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Responsabilités</h2>
            <p className="text-slate-600 mb-4">
              PayLink agit uniquement comme intermédiaire technique. Les paiements sont traités directement par 
              Orange Money et MTN MoMo. PayLink ne peut être tenu responsable des litiges entre vendeurs et clients.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Contenu Interdit</h2>
            <p className="text-slate-600 mb-4">
              Il est interdit d'utiliser PayLink pour :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Activités illégales ou frauduleuses</li>
              <li>Vente de produits/services illicites</li>
              <li>Collecte de fonds non autorisée</li>
              <li>Toute activité contraire aux bonnes mœurs</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Suspension et Résiliation</h2>
            <p className="text-slate-600 mb-4">
              PayLink se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes 
              CGU ou d'activité suspecte.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">9. Modification des CGU</h2>
            <p className="text-slate-600 mb-4">
              PayLink peut modifier ces conditions à tout moment. Les utilisateurs seront informés des changements 
              significatifs par email ou notification dans l'application.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">10. Contact</h2>
            <p className="text-slate-600 mb-4">
              Pour toute question relative aux présentes CGU, contactez-nous à : 
              <a href="mailto:legal@paylink.cm" className="text-blue-600 hover:underline"> legal@paylink.cm</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

