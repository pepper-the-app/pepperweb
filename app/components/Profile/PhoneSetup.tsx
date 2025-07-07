'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { toast } from 'react-hot-toast'
import { normalizePhoneNumber } from '@/lib/utils/phone'
import { Loader2, Phone } from 'lucide-react'
import { useStore } from '@/lib/store/useStore'

interface PhoneSetupProps {
  onComplete: () => void
}

export default function PhoneSetup({ onComplete }: PhoneSetupProps) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useStore()
  const supabase = createClient()

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    if (!normalizedPhone) {
      toast.error('Please enter a valid phone number')
      return
    }

    if (!user) {
      toast.error('Please sign in first')
      return
    }

    setLoading(true)
    try {
      // Update profile with phone number
      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: normalizedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        if (error.code === '23505') {
          throw new Error('This phone number is already in use')
        }
        throw error
      }

      toast.success('Phone number saved!')
      onComplete()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save phone number')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add Your Phone Number</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We need your phone number to match you with your contacts
        </p>
      </div>

      <form onSubmit={handleSavePhone} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Phone Number
          </label>
          <PhoneInput
            international
            defaultCountry="US"
            value={phone}
            onChange={(value) => setPhone(value || '')}
            className="phone-input"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This is how your contacts will find you
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !phone}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Phone className="w-5 h-5 mr-2" />
              Continue
            </>
          )}
        </button>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Privacy:</strong> Your phone number is only used for matching. 
            Others can only see it if you both match.
          </p>
        </div>
      </form>
    </div>
  )
} 