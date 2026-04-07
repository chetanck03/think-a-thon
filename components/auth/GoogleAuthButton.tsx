'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';

export function GoogleAuthButton() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError('');
      const response = await authAPI.googleAuth(credentialResponse.credential);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setAuth(user, token);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Google authentication failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed');
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="text-sm text-red-600 text-center">
        Google OAuth not configured
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <GoogleOAuthProvider clientId={clientId}>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}
