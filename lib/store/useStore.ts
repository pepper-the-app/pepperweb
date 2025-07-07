import { create } from 'zustand'
import { Database } from '@/lib/supabase/database.types'

type Contact = Database['public']['Tables']['contacts']['Row']
type Interest = Database['public']['Tables']['interests']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface AppState {
  // User data
  user: Profile | null
  setUser: (user: Profile | null) => void
  
  // Contacts
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  addContacts: (contacts: Contact[]) => void
  
  // Interests
  interests: Set<string> // Set of contact phone hashes
  setInterests: (interests: string[]) => void
  toggleInterest: (phoneHash: string) => void
  
  // Matches
  matches: Array<{
    contact_id: string
    contact_name: string
    contact_phone: string
    matched_at: string
  }>
  setMatches: (matches: any[]) => void
  
  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Clear all data
  clearAll: () => void
}

export const useStore = create<AppState>((set) => ({
  // User data
  user: null,
  setUser: (user) => set({ user }),
  
  // Contacts
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContacts: (newContacts) => set((state) => ({ 
    contacts: [...state.contacts, ...newContacts] 
  })),
  
  // Interests
  interests: new Set(),
  setInterests: (interests) => set({ interests: new Set(interests) }),
  toggleInterest: (phoneHash) => set((state) => {
    const newInterests = new Set(state.interests)
    if (newInterests.has(phoneHash)) {
      newInterests.delete(phoneHash)
    } else {
      newInterests.add(phoneHash)
    }
    return { interests: newInterests }
  }),
  
  // Matches
  matches: [],
  setMatches: (matches) => set({ matches }),
  
  // UI state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Clear all data
  clearAll: () => set({
    user: null,
    contacts: [],
    interests: new Set(),
    matches: [],
    isLoading: false
  })
})) 