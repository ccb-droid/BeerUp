# Environment Setup for Password Recovery

## Required Environment Variables

To fix the password recovery redirect URL issue, make sure you have these environment variables set:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration - IMPORTANT for password recovery!
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## For Different Environments

### Local Development
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Vercel Deployment
```bash
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### Custom Domain
```bash
NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
```

## Why This Matters

The `NEXT_PUBLIC_SITE_URL` environment variable is crucial for:
1. **Password recovery emails** - Determines where users are redirected after clicking the email link
2. **Email confirmation** - Used for account verification redirects
3. **OAuth callbacks** - Ensures proper redirect after social login

## Current Fallback Logic

The app now includes fallback logic that will:
1. Use `NEXT_PUBLIC_SITE_URL` if set
2. Fall back to `VERCEL_URL` if on Vercel
3. Default to `http://localhost:3000` for local development

## Vercel Deployment

If you're using Vercel, make sure to set the environment variable in your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_SITE_URL` with your production URL 