'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get parameters from URL fragment (hash)
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const error = hashParams.get('error');

        console.log('[Auth Callback] Hash params:', { access_token: !!access_token, refresh_token: !!refresh_token, type, error });

        // Handle errors from URL fragment
        if (error) {
          console.error('[Auth Callback] Error from hash:', error);
          if (error === 'access_denied') {
            router.replace('/forgot-password?error=expired');
            return;
          }
          router.replace(`/login?error=${error}`);
          return;
        }

        // If we have tokens in the hash, set the session
        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            console.error('[Auth Callback] Error setting session:', sessionError);
            router.replace('/login?error=invalid_session');
            return;
          }

          console.log('[Auth Callback] Session set successfully');

          // Route based on auth type
          if (type === 'recovery') {
            console.log('[Auth Callback] Recovery flow detected, redirecting to reset password');
            router.replace('/reset-password');
            return;
          }

          // Default redirect for other auth flows (signup confirmation, magic link, etc.)
          console.log('[Auth Callback] Default redirect to homepage');
          router.replace('/');
          return;
        }

        // Fallback: check URL search params for server-side flows (if any)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const urlType = urlParams.get('type');
        const urlError = urlParams.get('error');

        if (urlError) {
          console.error('[Auth Callback] Error from URL params:', urlError);
          router.replace(`/login?error=${urlError}`);
          return;
        }

        if (code) {
          console.log('[Auth Callback] Code found in URL params, handling server-side flow');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('[Auth Callback] Error exchanging code:', exchangeError);
            router.replace('/login?error=invalid_code');
            return;
          }

          // Route based on type
          if (urlType === 'recovery') {
            router.replace('/reset-password');
            return;
          }

          router.replace('/');
          return;
        }

        // No auth data found, redirect to homepage
        console.log('[Auth Callback] No auth data found, redirecting to homepage');
        router.replace('/');
      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error);
        router.replace('/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  // Optional: Show a loading spinner or branded loader
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
} 