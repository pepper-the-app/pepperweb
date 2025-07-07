'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Force dynamic rendering to avoid pre-rendering issues with Supabase client
export const dynamic = 'force-dynamic'
import { useStore } from '@/lib/store/useStore'
import { Toaster } from 'react-hot-toast'
import EmailAuth from './components/Auth/EmailAuth'
import PhoneSetup from './components/Profile/PhoneSetup'
import ContactsUpload from './components/Contacts/ContactsUpload'
import InterestSelection from './components/Interests/InterestSelection'
import MatchesDisplay from './components/Matches/MatchesDisplay'
import { LogOut, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import ResetButton from './components/Debug/ResetButton'

type AppStep = 'auth' | 'phone' | 'contacts' | 'interests' | 'matches'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('auth')
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const { user, setUser, contacts, clearAll } = useStore()
  const supabase = createClient()

  useEffect(() => {
    console.log('App mounted, checking user...')
    checkUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('Auth state changed:', event, session?.user?.email)
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        clearAll()
        setCurrentStep('auth')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    console.log('checkUser called')
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      console.log('Auth user check:', authUser?.email, error)
      
      if (error) {
        console.error('Error getting user:', error)
        setCurrentStep('auth')
        setAuthChecked(true)
        setLoading(false)
        return
      }
      
      if (authUser) {
        await loadUserProfile(authUser.id)
      } else {
        setCurrentStep('auth')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setCurrentStep('auth')
    } finally {
      setAuthChecked(true)
      setLoading(false)
      console.log('Loading set to false')
    }
  }

  const loadUserProfile = async (userId: string) => {
    console.log('loadUserProfile called for:', userId)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Profile loaded:', profile, error)

      if (error) {
        console.error('Error loading profile:', error)
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: { user } } = await supabase.auth.getUser()
          if (user?.email) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()
            
            if (!createError && newProfile) {
              setUser(newProfile)
              setCurrentStep('phone')
              return
            }
          }
        }
        return
      }

      if (profile) {
        setUser(profile)
        
        // Check if user has phone number
        if (!profile.phone_number) {
          setCurrentStep('phone')
          return
        }
        
        // Load contacts to determine step
        const { data: userContacts } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', userId)

        if (userContacts && userContacts.length > 0) {
          setCurrentStep('matches')
        } else {
          setCurrentStep('contacts')
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearAll()
    setCurrentStep('auth')
  }

  const handleBack = () => {
    if (currentStep === 'contacts') setCurrentStep('phone')
    else if (currentStep === 'interests') setCurrentStep('contacts')
    else if (currentStep === 'matches') setCurrentStep('interests')
  }

  const handleAuthSuccess = async () => {
    console.log('handleAuthSuccess called')
    // Reload user profile after successful auth
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await loadUserProfile(authUser.id)
    }
  }

  const handlePhoneComplete = async () => {
    // Reload profile to get updated phone number
    if (user) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (updatedProfile) {
        setUser(updatedProfile)
        setCurrentStep('contacts')
      }
    }
  }

  if (loading && !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-center" />
      <ResetButton />
      
      {/* Header */}
      {user && (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentStep !== 'phone' && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Pepper
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'auth' && (
              <EmailAuth onSuccess={handleAuthSuccess} />
            )}
            
            {currentStep === 'phone' && user && (
              <PhoneSetup onComplete={handlePhoneComplete} />
            )}
            
            {currentStep === 'contacts' && (
              <ContactsUpload onComplete={() => setCurrentStep('interests')} />
            )}
            
            {currentStep === 'interests' && (
              <InterestSelection onComplete={() => setCurrentStep('matches')} />
            )}
            
            {currentStep === 'matches' && (
              <MatchesDisplay />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      {user && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg">
            <div className={`w-2 h-2 rounded-full ${currentStep === 'phone' ? 'bg-purple-600' : currentStep !== 'auth' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'contacts' ? 'bg-purple-600' : currentStep === 'interests' || currentStep === 'matches' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'interests' ? 'bg-purple-600' : currentStep === 'matches' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'matches' ? 'bg-purple-600' : 'bg-gray-300'}`} />
          </div>
        </div>
      )}
    </main>
  )
}
