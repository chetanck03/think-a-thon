'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/authStore';

export function OTPAuthForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.sendOTP({ email, name: name || email.split('@')[0] });
      setStep('otp');
      setCountdown(600); // 10 minutes
      
      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP({ email, code: otp });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setAuth(user, token);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    setLoading(true);

    try {
      await authAPI.sendOTP({ email, name: name || email.split('@')[0] });
      setCountdown(600);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleSendOTP} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Full Name (Optional)"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Button type="submit" fullWidth loading={loading}>
          Send OTP Code
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
        {countdown > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            Code expires in {formatTime(countdown)}
          </p>
        )}
      </div>

      <Input
        label="Enter OTP Code"
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="123456"
        required
        maxLength={6}
        className="text-center text-2xl tracking-widest"
      />

      <Button type="submit" fullWidth loading={loading} disabled={otp.length !== 6}>
        Verify & Sign In
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-blue-600 hover:text-blue-700"
        >
          Change Email
        </button>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={countdown > 540 || loading}
          className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Resend Code
        </button>
      </div>
    </form>
  );
}
