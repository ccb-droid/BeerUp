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