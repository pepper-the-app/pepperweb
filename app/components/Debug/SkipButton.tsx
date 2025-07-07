'use client'

import { useStore } from '@/lib/store/useStore'
import { createClient } from '@/lib/supabase/client'
import { FastForward } from 'lucide-react'

export default function SkipButton() {
  const { setUser } = useStore()
  const supabase = createClient()

  const handleSkip = async () => {
    console.log('Skipping to phone setup...')
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Create a minimal user profile in state
      setUser({
        id: user.id,
        email: user.email!,
        phone_number: null,
        display_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      // Force reload to phone step
      window.location.reload()
    }
  }

  return (
    <button
      onClick={handleSkip}
      className="fixed bottom-4 left-4 p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
      title="Skip to Phone Setup (Debug)"
    >
      <FastForward className="w-5 h-5" />
    </button>
  )
} 