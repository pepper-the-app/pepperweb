'use client'

import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store/useStore'
import { RefreshCw } from 'lucide-react'

export default function ResetButton() {
  const { clearAll } = useStore()
  const supabase = createClient()

  const handleReset = async () => {
    console.log('Resetting app state...')
    
    // Clear all local storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear app state
    clearAll()
    
    // Reload the page
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleReset}
      className="fixed bottom-4 right-4 p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-50"
      title="Reset App (Debug)"
    >
      <RefreshCw className="w-5 h-5" />
    </button>
  )
} 