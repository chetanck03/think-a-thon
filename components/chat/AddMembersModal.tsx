'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { workspaceMembersAPI, channelsAPI } from '@/lib/api';
import { UserPlus, Check } from 'lucide-react';

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  channelId: string;
  channelName: string;
  currentMembers: { userId: string }[];
}

export function AddMembersModal({
  isOpen,
  onClose,
  workspaceId,
  channelId,
  channelName,
  currentMembers,
}: AddMembersModalProps) {
  const queryClient = useQueryClient();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Fetch workspace members
  const { data: workspaceMembers = [], isLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      const response = await workspaceMembersAPI.getMembers(workspaceId);
      return response.data;
    },
    enabled: isOpen,
  });

  const addMembersMutation = useMutation({
    mutationFn: async (memberIds: string[]) => {
      // Add members one by one (you may want to create a batch endpoint)
      const promises = memberIds.map((userId) =>
        channelsAPI.addMember(channelId, userId)
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', workspaceId] });
      setSelectedMembers([]);
      onClose();
    },
  });

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length > 0) {
      addMembersMutation.mutate(selectedMembers);
    }
  };

  // Filter out members who are already in the channel
  const currentMemberIds = currentMembers.map((m) => m.userId);
  const availableMembers = workspaceMembers.filter(
    (m: any) => !currentMemberIds.includes(m.userId)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Members to #${channelName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">Loading members...</div>
        ) : availableMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            All workspace members are already in this channel
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableMembers.map((member: any) => {
              const isSelected = selectedMembers.includes(member.userId);
              return (
                <div
                  key={member.id}
                  onClick={() => toggleMember(member.userId)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.user.name}</div>
                      <div className="text-sm text-gray-600">{member.user.email}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={addMembersMutation.isPending}
            disabled={selectedMembers.length === 0 || availableMembers.length === 0}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add {selectedMembers.length > 0 ? `(${selectedMembers.length})` : ''}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
