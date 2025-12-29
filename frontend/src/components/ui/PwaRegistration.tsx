'use client'

import { useEffect } from 'react'

export function PwaRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      window.addEventListener('load', function () {
        navigator.serviceWorker
          .register('/sw.js')
          .then(function (registration) {
            console.log('SW registered: ', registration)
          })
          .catch(function (registrationError) {
            console.log('SW registration failed: ', registrationError)
          })
      })
    }
  }, [])

  return null
}

