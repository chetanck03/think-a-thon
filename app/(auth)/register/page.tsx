'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { OTPAuthForm } from '@/components/auth/OTPAuthForm';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export default function RegisterPage() {
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('otp');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 relative">
      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
        <p className="text-gray-600">Create your StartupOps account</p>
      </div>

      {/* Google Auth */}
      <div className="mb-6">
        <GoogleAuthButton />
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Auth Method Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setAuthMethod('otp')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            authMethod === 'otp'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          OTP Code
        </button>
        <button
          onClick={() => setAuthMethod('password')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            authMethod === 'password'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Password
        </button>
      </div>

      {/* Auth Forms */}
      {authMethod === 'otp' ? <OTPAuthForm /> : <RegisterForm />}

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
