/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://thkpfeuwwyocnbavgsqn.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoa3BmZXV3d3lvY25iYXZnc3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NDc1MzYsImV4cCI6MjA2MzEyMzUzNn0.p-ho5a9n9iIQkYh90Sgc0Uz7ZztTBmRmLtMrcLhAaFM"
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
