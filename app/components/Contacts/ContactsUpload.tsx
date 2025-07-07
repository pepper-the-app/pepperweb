'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store/useStore'
import { toast } from 'react-hot-toast'
import { Upload, Users, FileText, Loader2 } from 'lucide-react'
import { parseContactsFromText, normalizePhoneNumber, hashPhoneNumber } from '@/lib/utils/phone'

interface ContactsUploadProps {
  onComplete: () => void
}

export default function ContactsUpload({ onComplete }: ContactsUploadProps) {
  const [loading, setLoading] = useState(false)
  const [contactText, setContactText] = useState('')
  const [uploadMethod, setUploadMethod] = useState<'paste' | 'file'>('paste')
  const { user, setContacts } = useStore()
  const supabase = createClient()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setContactText(text)
    }
    reader.readAsText(file)
  }

  const handleUploadContacts = async () => {
    if (!contactText.trim()) {
      toast.error('Please add some contacts')
      return
    }

    if (!user) {
      toast.error('Please sign in first')
      return
    }

    setLoading(true)
    try {
      // Parse contacts from text
      const parsedContacts = parseContactsFromText(contactText)
      
      if (parsedContacts.length === 0) {
        toast.error('No valid contacts found. Please check the format.')
        return
      }

      // Prepare contacts for database
      const contactsToInsert = parsedContacts.map(contact => ({
        user_id: user.id,
        contact_name: contact.name,
        contact_phone: contact.phoneNumber,
        contact_phone_hash: hashPhoneNumber(contact.phoneNumber),
      }))

      // Insert contacts
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsToInsert)
        .select()

      if (error) {
        if (error.code === '23505') {
          toast.error('Some contacts already exist')
        } else {
          throw error
        }
      }

      if (data) {
        setContacts(data)
        toast.success(`Added ${data.length} contacts!`)
        onComplete()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload contacts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add Your Contacts</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Import your contacts to see who's interested in you
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
        {/* Upload method selector */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => setUploadMethod('paste')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              uploadMethod === 'paste'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Paste Contacts
          </button>
          <button
            onClick={() => setUploadMethod('file')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              uploadMethod === 'file'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload File
          </button>
        </div>

        {uploadMethod === 'paste' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Paste your contacts (one per line)
            </label>
            <textarea
              value={contactText}
              onChange={(e) => setContactText(e.target.value)}
              placeholder="John Doe: +1 234 567 8900
Jane Smith, (555) 123-4567
Bob Wilson 9876543210"
              className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Format: Name: Phone or Name, Phone or Name Phone
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload a text file with contacts
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-purple-600 dark:text-purple-400 hover:underline"
              >
                Choose a file
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                or drag and drop
              </p>
            </div>
            {contactText && (
              <p className="text-sm text-green-600 dark:text-green-400">
                File loaded successfully
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUploadContacts}
            disabled={loading || !contactText.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Upload Contacts
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Privacy Notice:</strong> Your contacts are encrypted and only used to find mutual matches. 
            We never share your data or contact anyone without consent.
          </p>
        </div>
      </div>
    </div>
  )
} 