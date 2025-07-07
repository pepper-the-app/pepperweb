export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone_number: string | null
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone_number?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone_number?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          contact_name: string
          contact_phone: string
          contact_phone_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_name: string
          contact_phone: string
          contact_phone_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_name?: string
          contact_phone?: string
          contact_phone_hash?: string
          created_at?: string
        }
      }
      interests: {
        Row: {
          id: string
          interested_user_id: string
          target_phone_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          interested_user_id: string
          target_phone_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          interested_user_id?: string
          target_phone_hash?: string
          created_at?: string
        }
      }
    }
    Views: {
      matches: {
        Row: {
          user1_id: string
          user1_phone: string
          user1_name: string | null
          user2_id: string
          user2_phone: string
          user2_name: string | null
          matched_at: string
        }
      }
    }
    Functions: {
      get_mutual_interests: {
        Args: {
          user_id: string
        }
        Returns: {
          contact_id: string
          contact_name: string
          contact_phone: string
          matched_at: string
        }[]
      }
    }
    Enums: {}
  }
} 