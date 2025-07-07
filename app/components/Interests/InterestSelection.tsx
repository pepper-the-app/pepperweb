'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store/useStore'
import { toast } from 'react-hot-toast'
import { Heart, Search, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InterestSelectionProps {
  onComplete: () => void
}

export default function InterestSelection({ onComplete }: InterestSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user, contacts, interests, toggleInterest, setInterests } = useStore()
  const supabase = createClient()

  // Load existing interests
  useEffect(() => {
    loadInterests()
  }, [])

  const loadInterests = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('target_phone_hash')
        .eq('interested_user_id', user.id)

      if (error) throw error

      if (data) {
        setInterests(data.map(item => item.target_phone_hash))
      }
    } catch (error: any) {
      toast.error('Failed to load interests')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveInterests = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Delete all existing interests
      await supabase
        .from('interests')
        .delete()
        .eq('interested_user_id', user.id)

      // Insert new interests
      if (interests.size > 0) {
        const interestsToInsert = Array.from(interests).map(phoneHash => ({
          interested_user_id: user.id,
          target_phone_hash: phoneHash,
        }))

        const { error } = await supabase
          .from('interests')
          .insert(interestsToInsert)

        if (error) throw error
      }

      toast.success('Interests saved!')
      onComplete()
    } catch (error: any) {
      toast.error('Failed to save interests')
    } finally {
      setSaving(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Who Are You Interested In?</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select the contacts you're romantically interested in
        </p>
        <p className="text-sm text-purple-600 dark:text-purple-400">
          Don't worry, they'll only know if they're interested in you too!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Contacts list */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredContacts.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No contacts found
              </p>
            ) : (
              filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => toggleInterest(contact.contact_phone_hash)}
                    className={`w-full p-4 rounded-lg border transition-all ${
                      interests.has(contact.contact_phone_hash)
                        ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {contact.contact_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.contact_phone}
                        </p>
                      </div>
                      <Heart
                        className={`w-6 h-6 transition-all ${
                          interests.has(contact.contact_phone_hash)
                            ? 'text-pink-500 fill-pink-500 scale-110'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {contacts.length} contacts total
          </p>
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
            {interests.size} selected
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveInterests}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Save Interests
            </>
          )}
        </button>
      </div>
    </div>
  )
} 