'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [workspaceId, setWorkspaceId] = useState('');

  useEffect(() => {
    // Extract workspace ID from token (simplified - in production, validate on backend)
    // For now, we'll need to pass workspaceId in the invite link
    const urlParams = new URLSearchParams(window.location.search);
    const wId = urlParams.get('workspace');
    if (wId) {
      setWorkspaceId(wId);
    }
  }, []);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invite/${token}?workspace=${workspaceId}`);
      return;
    }

    if (!workspaceId) {
      setError('Invalid invite link');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/workspace-members/join/${token}`, { workspaceId });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/workspace/${workspaceId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to join workspace');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the team!</h1>
          <p className="text-gray-600 mb-4">
            You've successfully joined the workspace. Redirecting...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Workspace</h1>
          <p className="text-gray-600">
            You've been invited to join a workspace on StartupOps
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Please sign in or create an account to join this workspace
            </p>
            <Button fullWidth onClick={() => router.push(`/login?redirect=/invite/${token}?workspace=${workspaceId}`)}>
              Sign In to Join
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={() => router.push(`/register?redirect=/invite/${token}?workspace=${workspaceId}`)}
            >
              Create Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Joining as:</span> {user?.name}
              </p>
              <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
            </div>
            <Button fullWidth onClick={handleJoin} loading={loading}>
              Join Workspace
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
