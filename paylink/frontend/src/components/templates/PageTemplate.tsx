'use client'

import { type Page, type TemplateType } from '@/types'
import { ServiceProviderTemplate } from './ServiceProviderTemplate'
import { SimpleSaleTemplate } from './SimpleSaleTemplate'
import { DonationTemplate } from './DonationTemplate'
import { TrainingTemplate } from './TrainingTemplate'
import { EventTemplate } from './EventTemplate'
import { AssociationTemplate } from './AssociationTemplate'

interface PageTemplateProps {
  page: Page
  onPayment: (serviceId?: string, amount?: number) => void
  isLoading?: boolean
}

/**
 * Composant principal qui rend dynamiquement le bon template
 * selon le type de page (templateType)
 */
export function PageTemplate({ page, onPayment, isLoading = false }: PageTemplateProps) {
  const templateComponents: Record<TemplateType, React.ComponentType<PageTemplateProps>> = {
    SERVICE_PROVIDER: ServiceProviderTemplate,
    SIMPLE_SALE: SimpleSaleTemplate,
    DONATION: DonationTemplate,
    TRAINING: TrainingTemplate,
    EVENT: EventTemplate,
    ASSOCIATION: AssociationTemplate,
  }

  const TemplateComponent = templateComponents[page.templateType]

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Template non trouvé</p>
      </div>
    )
  }

  return <TemplateComponent page={page} onPayment={onPayment} isLoading={isLoading} />
}

// Export des props pour les templates individuels
export type { PageTemplateProps }

