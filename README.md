# Pepper 💕

A privacy-focused web app that helps you discover mutual romantic interests within your contact list. Find out which of your friends are interested in you too!

## Features

- 🔐 **Email Magic Link** - Simple, passwordless authentication
- 📱 **Contact Import** - Easy contact list upload
- 💘 **Private Matching** - Only reveals mutual interests
- 🔒 **Privacy First** - Hashed phone numbers, encrypted data
- ⚡ **Real-time Updates** - Instant match notifications

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [Supabase](https://supabase.com/) (Auth, Database, Real-time)
- **Deployment:** [Vercel](https://vercel.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **UI Components:** [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pepperweb
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `supabase/schema.sql`

5. Enable Phone Auth in Supabase:
   - Go to Authentication > Providers
   - Enable Phone provider
   - Configure your SMS provider (Twilio, MessageBird, etc.)

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

1. **Sign Up/In**: Users sign in with their email via magic link
2. **Add Phone Number**: Users add their phone number for matching
3. **Import Contacts**: Upload phone contacts via text paste or file
4. **Select Interests**: Mark contacts you're romantically interested in
5. **See Matches**: View only mutual interests - both must select each other

## Privacy & Security

- Phone numbers are hashed before storage
- Row Level Security (RLS) ensures users only see their own data
- No contact is made without explicit user action
- All data is encrypted in transit and at rest

## Database Schema

- `profiles` - User profiles linked to auth
- `contacts` - User's uploaded contacts
- `interests` - Who each user is interested in
- `matches` - View showing mutual interests

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fpepperweb)

## License

MIT
