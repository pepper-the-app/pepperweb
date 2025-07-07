'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store/useStore'
import { toast } from 'react-hot-toast'
import { Heart, Sparkles, RefreshCw, Loader2, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPhoneNumber } from '@/lib/utils/phone'

export default function MatchesDisplay() {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { user, matches, setMatches, contacts } = useStore()
  const supabase = createClient()

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('get_mutual_interests', { user_id: user.id })

      if (error) throw error

      if (data) {
        setMatches(data)
      }
    } catch (error: any) {
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadMatches()
    setRefreshing(false)
    toast.success('Matches refreshed!')
  }

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
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Your Matches
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          These people are interested in you too!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
        {/* Refresh button */}
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Matches list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {matches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No matches yet. Keep adding contacts!
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Matches appear when both people are interested in each other
                </p>
              </motion.div>
            ) : (
              matches.map((match, index) => (
                <motion.div
                  key={match.contact_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 animate-pulse" />
                  <div className="relative bg-white dark:bg-gray-700 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white fill-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {match.contact_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPhoneNumber(match.contact_phone) || match.contact_phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`sms:${match.contact_phone}`}
                          className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Matched {new Date(match.matched_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Fun stats */}
        {matches.length > 0 && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-center text-purple-700 dark:text-purple-300">
              🎉 You have <strong>{matches.length}</strong> mutual {matches.length === 1 ? 'match' : 'matches'}!
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 