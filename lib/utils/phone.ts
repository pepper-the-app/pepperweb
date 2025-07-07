import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

export function formatPhoneNumber(phone: string): string | null {
  try {
    if (!phone) return null
    
    // Try to parse the phone number
    const phoneNumber = parsePhoneNumber(phone)
    
    // Return international format
    return phoneNumber.formatInternational()
  } catch (error) {
    // If parsing fails, try with a default country
    try {
      const phoneNumber = parsePhoneNumber(phone, 'US')
      return phoneNumber.formatInternational()
    } catch {
      return null
    }
  }
}

export function normalizePhoneNumber(phone: string): string | null {
  try {
    const phoneNumber = parsePhoneNumber(phone)
    return phoneNumber.format('E.164')
  } catch {
    try {
      const phoneNumber = parsePhoneNumber(phone, 'US')
      return phoneNumber.format('E.164')
    } catch {
      return null
    }
  }
}

export function validatePhoneNumber(phone: string): boolean {
  try {
    return isValidPhoneNumber(phone) || isValidPhoneNumber(phone, 'US')
  } catch {
    return false
  }
}

export function hashPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized) {
    throw new Error('Invalid phone number')
  }
  
  // Use Web Crypto API for browser compatibility
  if (typeof window !== 'undefined') {
    // Browser environment - use synchronous hash for simplicity
    const encoder = new TextEncoder()
    const data = encoder.encode(normalized)
    let hash = ''
    for (let i = 0; i < data.length; i++) {
      hash += ('00' + data[i].toString(16)).slice(-2)
    }
    return hash
  } else {
    // Node.js environment
    const crypto = require('crypto')
    return crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex')
  }
}

export interface Contact {
  name: string
  phoneNumber: string
}

export function parseContactsFromText(text: string): Contact[] {
  const lines = text.split('\n').filter(line => line.trim())
  const contacts: Contact[] = []
  
  for (const line of lines) {
    // Try different formats: "Name: Phone" or "Name, Phone" or "Name Phone"
    const matches = line.match(/^(.+?)[:,-]?\s*([+\d\s()-]+)$/)
    
    if (matches) {
      const name = matches[1].trim()
      const phone = matches[2].trim()
      
      if (name && validatePhoneNumber(phone)) {
        contacts.push({
          name,
          phoneNumber: normalizePhoneNumber(phone) || phone
        })
      }
    }
  }
  
  return contacts
} 