'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Users, UserPlus, Link as LinkIcon, Copy, CheckCircle2, Crown, Trash2, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { useAuthStore } from '@/lib/stores/authStore';

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export function TeamMembers({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEmailInviteModalOpen, setIsEmailInviteModalOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailInvite, setEmailInvite] = useState({ email: '', message: '' });

  // Fetch members
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      try {
        const response = await api.get(`/workspace-members/${workspaceId}/members`);
        console.log('Members API response:', response.data);
        return response.data;
      } catch (err: any) {
        console.error('Members API error:', err.response?.data || err.message);
        throw err;
      }
    },
  });

  // Generate invite link
  const generateInviteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/workspace-members/${workspaceId}/invite`);
      return response.data;
    },
    onSuccess: (data) => {
      setInviteLink(data.inviteLink);
      setIsInviteModalOpen(true);
    },
  });

  // Remove member
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await api.delete(`/workspace-members/${workspaceId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      setDeletingMember(null);
    },
  });

  // Send email invitation
  const sendEmailInviteMutation = useMutation({
    mutationFn: async (data: { email: string; message?: string }) => {
      return await api.post(`/workspace-members/${workspaceId}/invite-email`, data);
    },
    onSuccess: () => {
      setIsEmailInviteModalOpen(false);
      setEmailInvite({ email: '', message: '' });
      alert('Invitation sent successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || 'Failed to send invitation');
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = members.find((m: Member) => m.user.id === currentUser?.id)?.role === 'owner';
  const canInvite = isOwner; // Only owner can invite

  // Debug logging
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log('Token in localStorage:', token ? 'EXISTS' : 'MISSING');
  console.log('Current user:', currentUser?.id);
  console.log('Members:', members);
  console.log('Is owner:', isOwner);
  console.log('Can invite:', canInvite);
  console.log('API Error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading team members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-600 mb-4">Failed to load team members</div>
        <p className="text-sm text-gray-600 mb-4">
          {(error as any)?.response?.data?.error?.message || 'Please try logging in again'}
        </p>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            <p className="text-sm text-gray-600">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {canInvite && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setIsEmailInviteModalOpen(true)} variant="outline" className="w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Invite by Email</span>
              <span className="sm:hidden">Email</span>
            </Button>
            <Button onClick={() => generateInviteMutation.mutate()} className="w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Get Invite Link</span>
              <span className="sm:hidden">Link</span>
            </Button>
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {members.map((member: Member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{member.user.name}</h4>
                    {member.role === 'owner' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium whitespace-nowrap">
                        <Crown className="w-3 h-3" />
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{member.user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {isOwner && member.role !== 'owner' && member.user.id !== currentUser?.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeletingMember(member)}
                  disabled={removeMemberMutation.isPending}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteLink('');
          setCopied(false);
        }}
        title="Invite Team Members"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Share this invite link</p>
                <p className="text-xs text-blue-700">
                  Anyone with this link can join your workspace. The link expires in 7 days.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-mono"
            />
            <Button onClick={handleCopyLink}>
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">How to invite:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Copy the invite link above</li>
              <li>Share it with your team via email, Slack, or any messaging app</li>
              <li>They'll be able to join your workspace instantly</li>
            </ol>
          </div>
        </div>
      </Modal>

      {/* Email Invite Modal */}
      <Modal
        isOpen={isEmailInviteModalOpen}
        onClose={() => {
          setIsEmailInviteModalOpen(false);
          setEmailInvite({ email: '', message: '' });
        }}
        title="Invite by Email"
      >
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-1">Send a personalized invitation</p>
                <p className="text-xs text-purple-700">
                  We'll send an email with an invite link to join your workspace.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={emailInvite.email}
              onChange={(e) => setEmailInvite({ ...emailInvite, email: e.target.value })}
              placeholder="colleague@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={emailInvite.message}
              onChange={(e) => setEmailInvite({ ...emailInvite, message: e.target.value })}
              placeholder="Add a personal note to your invitation..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => sendEmailInviteMutation.mutate(emailInvite)}
              loading={sendEmailInviteMutation.isPending}
              disabled={!emailInvite.email}
              fullWidth
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEmailInviteModalOpen(false);
                setEmailInvite({ email: '', message: '' });
              }}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Member Confirmation Modal */}
      <Modal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        title="Remove Team Member"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to remove <strong>{deletingMember?.user.name}</strong> from this workspace? 
            They will lose access to all workspace content and data.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                if (deletingMember) {
                  removeMemberMutation.mutate(deletingMember.id);
                }
              }}
              loading={removeMemberMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              fullWidth
            >
              Remove Member
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeletingMember(null)}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
