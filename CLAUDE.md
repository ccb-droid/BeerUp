# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BeerUp is a Next.js 15 beer review application built with TypeScript, Supabase, and Tailwind CSS. Users can discover beers, write reviews, and manage their beer experiences.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with profiles table
- **Storage**: Supabase Storage for beer and review images
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Forms**: React Hook Form with Zod validation

### Project Structure

```
app/                    # Next.js App Router pages
├── (auth)/            # Auth-related pages (login, register, etc.)
├── api/               # API routes for auth and data operations
├── beer/[id]/         # Dynamic beer detail pages
└── layout.tsx         # Root layout with providers

components/
├── features/          # Feature-based components
│   ├── auth/         # Authentication forms
│   ├── beers/        # Beer-related components (grid, cards, search)
│   └── reviews/      # Review components (add dialog, lists)
├── layout/           # Layout components (header, providers)
├── shared/           # Shared utility components
└── ui/               # shadcn/ui design system components

lib/
├── actions/          # Server actions for data operations
├── auth/             # Authentication utilities and context
├── hooks/            # Custom React hooks
├── supabase/         # Supabase client configuration
├── types/            # TypeScript type definitions
├── validations/      # Zod schemas for form validation
└── utils.ts          # Utility functions
```

### Database Schema

- **beers**: Core beer information (name, brewery, style, description, image_url)
- **reviews**: User reviews with ratings and optional images
- **profiles**: User profile data linked to Supabase auth

### Key Patterns

**Server Actions**: All data mutations use Next.js server actions located in `lib/actions/`:
- `beers.ts` - Beer CRUD operations
- `reviews.ts` - Review management
- `auth.ts` - Authentication helpers

**Component Organization**: Features are organized by domain with dedicated folders containing related components and their index exports.

**Authentication Flow**: 
- Supabase Auth handles authentication
- `AuthProvider` manages auth state globally
- `profiles` table stores additional user data
- RLS policies control data access

**Image Handling**: 
- Images stored in Supabase Storage `beer-images` bucket
- New beers require images, existing beer reviews have optional images
- Images are uploaded during form submission in server actions

### Development Notes

- All server actions include extensive error logging and user feedback
- Forms use React Hook Form with Zod validation schemas
- The app uses TypeScript strict mode with proper typing throughout
- Supabase types are auto-generated in `lib/supabase/types.ts`
- Authentication state is managed through React Context and React Query