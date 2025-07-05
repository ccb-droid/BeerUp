'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ResetPasswordForm } from '@/components/features/auth';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check URL parameters for recovery token
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = urlParams.get('type') || hashParams.get('type');
        
        // If we have recovery tokens in the URL, Supabase should automatically set the session
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('[Reset Password] Recovery tokens found in URL, waiting for session...');
          // Set the session explicitly with the tokens from URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('[Reset Password] Error setting session from URL tokens:', sessionError);
            router.replace('/forgot-password?error=invalid_tokens');
            return;
          }
          
          // Give Supabase a moment to process the tokens
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Reset Password] Error checking session:', error);
          router.replace('/forgot-password?error=session_error');
          return;
        }

        if (!session) {
          console.log('[Reset Password] No session found, redirecting to forgot password');
          router.replace('/forgot-password?error=no_session');
          return;
        }

        // Additional validation: check if this is actually a recovery session
        // Recovery sessions should not have a refresh token that's too old
        const isRecoverySession = session.user?.recovery_sent_at || 
                                 type === 'recovery' || 
                                 accessToken !== null;
        
        if (!isRecoverySession) {
          console.log('[Reset Password] Not a recovery session, redirecting to forgot password');
          router.replace('/forgot-password?error=invalid_session');
          return;
        }

        console.log('[Reset Password] Session found, allowing access');
        setHasSession(true);
      } catch (error) {
        console.error('[Reset Password] Unexpected error:', error);
        router.replace('/forgot-password?error=unexpected_error');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasSession) {
    return null; // Will redirect in useEffect
  }

  return <ResetPasswordForm />;
} 