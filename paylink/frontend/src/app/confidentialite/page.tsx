'use client'

import Link from 'next/link'
import { Wallet, ArrowLeft, Shield } from 'lucide-react'

export default function ConfidentialitePage() {
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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Politique de Confidentialité</h1>
              <p className="text-slate-500">Dernière mise à jour : Décembre 2024</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              Chez PayLink, nous accordons une importance primordiale à la protection de vos données personnelles. 
              Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Données Collectées</h2>
            <p className="text-slate-600 mb-4">
              Nous collectons les données suivantes :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Informations d'inscription</strong> : nom, email, numéro de téléphone</li>
              <li><strong>Données de paiement</strong> : numéro Mobile Money (pour les transactions)</li>
              <li><strong>Données d'utilisation</strong> : pages visitées, actions effectuées</li>
              <li><strong>Données techniques</strong> : adresse IP, type de navigateur</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Utilisation des Données</h2>
            <p className="text-slate-600 mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Fournir et améliorer nos services</li>
              <li>Traiter les transactions de paiement</li>
              <li>Vous contacter pour le support ou les mises à jour</li>
              <li>Prévenir la fraude et assurer la sécurité</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Partage des Données</h2>
            <p className="text-slate-600 mb-4">
              Nous ne vendons jamais vos données personnelles. Nous les partageons uniquement avec :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Opérateurs Mobile Money</strong> : Orange Money, MTN MoMo (pour les transactions)</li>
              <li><strong>Prestataires techniques</strong> : hébergement, sécurité</li>
              <li><strong>Autorités</strong> : si requis par la loi</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Sécurité des Données</h2>
            <p className="text-slate-600 mb-4">
              Nous mettons en œuvre des mesures de sécurité robustes :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Stockage sécurisé des mots de passe (hashage bcrypt)</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Surveillance continue des activités suspectes</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Conservation des Données</h2>
            <p className="text-slate-600 mb-4">
              Nous conservons vos données :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Données de compte</strong> : tant que votre compte est actif</li>
              <li><strong>Transactions</strong> : 5 ans (obligation légale)</li>
              <li><strong>Logs techniques</strong> : 12 mois</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Vos Droits</h2>
            <p className="text-slate-600 mb-4">
              Vous avez le droit de :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Accéder</strong> à vos données personnelles</li>
              <li><strong>Rectifier</strong> les informations inexactes</li>
              <li><strong>Supprimer</strong> votre compte et vos données</li>
              <li><strong>Exporter</strong> vos données dans un format lisible</li>
              <li><strong>Vous opposer</strong> à certains traitements</li>
            </ul>
            <p className="text-slate-600 mb-4">
              Pour exercer ces droits, contactez-nous à : 
              <a href="mailto:privacy@paylink.cm" className="text-blue-600 hover:underline"> privacy@paylink.cm</a>
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Cookies</h2>
            <p className="text-slate-600 mb-4">
              Nous utilisons des cookies essentiels pour le fonctionnement du site. Aucun cookie publicitaire 
              n'est utilisé. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Modifications</h2>
            <p className="text-slate-600 mb-4">
              Cette politique peut être mise à jour. Nous vous informerons des changements significatifs 
              par email ou notification dans l'application.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">9. Contact</h2>
            <p className="text-slate-600 mb-4">
              Pour toute question concernant cette politique :
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700">
                <strong>PayLink - Protection des données</strong><br />
                Email : <a href="mailto:privacy@paylink.cm" className="text-blue-600 hover:underline">privacy@paylink.cm</a><br />
                Adresse : Douala, Cameroun
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

