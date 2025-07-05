'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const handleAuthCallback = async () => {
      try {
        console.log('[Auth Callback] Processing authentication callback');
        
        // Check URL parameters for error handling
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        
        const urlError = urlParams.get('error') || hashParams.get('error');
        
        // Handle errors
        if (urlError) {
          console.error('[Auth Callback] Error detected:', urlError);
          if (urlError === 'access_denied') {
            router.replace('/forgot-password?error=expired');
            return;
          }
          router.replace(`/login?error=${urlError}`);
          return;
        }

        // Listen for auth state changes to handle password recovery
        authListener = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[Auth Callback] Auth state change:', event, !!session);
          
          if (event === 'PASSWORD_RECOVERY') {
            console.log('[Auth Callback] Password recovery detected, redirecting to reset password');
            // Set processing to false before redirecting
            setIsProcessing(false);
            router.replace('/reset-password');
            return;
          }
          
          if (event === 'SIGNED_IN' && session) {
            console.log('[Auth Callback] User signed in, redirecting to homepage');
            setIsProcessing(false);
            router.replace('/');
            return;
          }
          
          if (event === 'TOKEN_REFRESHED' && session) {
            console.log('[Auth Callback] Token refreshed, redirecting to homepage');
            setIsProcessing(false);
            router.replace('/');
            return;
          }
        });

        // Give Supabase a moment to process the session automatically
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if we already have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth Callback] Error getting session:', sessionError);
          router.replace('/login?error=session_error');
          return;
        }

        if (session) {
          // Check if this is a password recovery session
          // Password recovery sessions have a specific access token pattern
          const isPasswordRecovery = session.user?.recovery_sent_at || 
                                   window.location.hash.includes('type=recovery') ||
                                   window.location.search.includes('type=recovery');
          
          if (isPasswordRecovery) {
            console.log('[Auth Callback] Password recovery session detected, redirecting to reset password');
            router.replace('/reset-password');
            return;
          }
          
          console.log('[Auth Callback] Regular session found, redirecting to homepage');
          router.replace('/');
          return;
        }

        // If no session is found after waiting, redirect to login
        setTimeout(() => {
          console.log('[Auth Callback] No session found after timeout, redirecting to login');
          router.replace('/login?error=no_session');
        }, 2000);
        
      } catch (error) {
        console.error('[Auth Callback] Unexpected error:', error);
        router.replace('/login?error=callback_error');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();

    // Cleanup function
    return () => {
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [router]);

  // Show loading spinner while processing
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
} 