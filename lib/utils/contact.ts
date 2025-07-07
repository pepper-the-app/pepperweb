export interface Contact {
  name: string
  email: string
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function hashEmail(email: string): string {
  const normalized = normalizeEmail(email)
  
  // Simple hash function for demo purposes
  // In production, use a proper crypto hash
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

export function parseContactsFromText(text: string): Contact[] {
  const lines = text.split('\n').filter(line => line.trim())
  const contacts: Contact[] = []
  
  for (const line of lines) {
    // Try different formats: "Name: Email" or "Name, Email" or "Name Email"
    const matches = line.match(/^(.+?)[:,-]?\s*([\w.-]+@[\w.-]+\.\w+)$/)
    
    if (matches) {
      const name = matches[1].trim()
      const email = matches[2].trim()
      
      if (name && validateEmail(email)) {
        contacts.push({
          name,
          email: normalizeEmail(email)
        })
      }
    }
  }
  
  return contacts
} 