'use client';

import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { User, Mail, Calendar, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

export default function ProfilePage() {
  const { user: storeUser } = useAuthStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await authAPI.getMe();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  const userData = user || storeUser;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">Manage your account information</p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {/* Profile Header Card */}
        <Card className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{userData?.name}</h2>
              <div className="flex items-center gap-2 text-gray-600 mb-4 text-sm md:text-base">
                <Mail className="w-4 h-4" />
                <span className="break-all">{userData?.email}</span>
              </div>
              {userData?.isVerified && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Verified Account
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Account Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Account Details
          </h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                  {userData?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                  {userData?.email}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authentication Method
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200 capitalize">
                  {userData?.authProvider || 'Email'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className={`inline-flex items-center gap-1 ${userData?.isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                    {userData?.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Pending Verification
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {userData?.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Account Security */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Security Information
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <span className="text-sm text-gray-500">Coming Soon</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-600">
                  {userData?.authProvider === 'google' 
                    ? 'You sign in with Google' 
                    : 'Last changed recently'}
                </p>
              </div>
              {userData?.authProvider !== 'google' && (
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Change
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Connected Accounts</p>
                <p className="text-sm text-gray-600">
                  {userData?.googleId ? 'Google account connected' : 'No connected accounts'}
                </p>
              </div>
              {userData?.googleId && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
