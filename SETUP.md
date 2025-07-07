# Pepper - Setup Guide

## Quick Start

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Get Your API Keys

1. Go to Settings → API in your Supabase dashboard
2. Copy:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon` public key (safe for browser use)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up the Database

1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the entire contents of `supabase/schema.sql`
3. Click "Run" to execute

### 5. Enable Email Authentication

1. Go to Authentication → Providers
2. Email should be enabled by default
3. Configure email settings:
   - Go to Authentication → Email Templates
   - Customize the magic link email if desired
   - For production, configure a custom SMTP server for better deliverability

### 6. Configure Authentication Settings

1. Go to Authentication → URL Configuration
2. Set Site URL to `http://localhost:3000` (for development)
3. Add `http://localhost:3000` to Redirect URLs

### 7. Test Your Setup

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and try signing up with your phone number!

## Troubleshooting

### "Your project's URL and API key are required"
- Make sure `.env.local` file exists with correct values
- Restart the development server after adding environment variables

### Email not sending
- Check email settings in Authentication → Email Templates
- For local development, emails are sent through Supabase's default SMTP
- Check spam folder if emails aren't appearing
- For production, configure a custom SMTP provider

### Database errors
- Ensure all SQL from `schema.sql` was executed successfully
- Check Supabase logs for any migration errors

## Production Deployment

1. Add environment variables to your Vercel project:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Update Supabase Authentication URLs:
   - Add your production URL to Site URL and Redirect URLs
   - Format: `https://your-app.vercel.app`

3. Configure production SMS provider:
   - Set up a paid SMS service for higher volume
   - Update credentials in Supabase Phone Provider settings

## Security Notes

- Never commit `.env.local` to version control
- The `anon` key is safe for browser use (has RLS policies)
- Keep your `service_role` key secret (server-side only)
- Phone numbers are hashed before storage for privacy 