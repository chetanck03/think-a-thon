'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Hash, Lock, MessageCircle, Plus, Trash2, UserPlus } from 'lucide-react';
import { channelsAPI, workspaceMembersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';
import { AddMembersModal } from './AddMembersModal';

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm';
  members: { 
    userId: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  _count: { messages: number };
}

interface ChannelSidebarProps {
  workspaceId: string;
  activeChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: () => void;
  canCreateChannel: boolean;
}

export function ChannelSidebar({
  workspaceId,
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
  canCreateChannel,
}: ChannelSidebarProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [addMembersChannel, setAddMembersChannel] = useState<Channel | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels', workspaceId],
    queryFn: async () => {
      const response = await channelsAPI.getByWorkspace(workspaceId);
      return response.data;
    },
  });

  // Fetch workspace members for DM list
  const { data: workspaceMembers = [] } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      const response = await workspaceMembersAPI.getMembers(workspaceId);
      return response.data;
    },
  });

  const joinChannelMutation = useMutation({
    mutationFn: (channelId: string) => channelsAPI.join(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', workspaceId] });
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: (channelId: string) => channelsAPI.delete(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', workspaceId] });
    },
  });

  const createDMMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      const otherUser = workspaceMembers.find((m: any) => m.userId === otherUserId);
      return await channelsAPI.create({
        workspaceId,
        name: otherUser?.user?.name || 'Direct Message',
        type: 'dm',
        memberIds: [otherUserId],
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['channels', workspaceId] });
      onChannelSelect(response.data.id);
    },
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'dm':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const isMember = (channel: Channel) => {
    return channel.members.some((m) => m.userId === user?.id);
  };

  if (isLoading) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-gray-600">Loading channels...</div>
      </div>
    );
  }

  const publicChannels = channels.filter((c: Channel) => c.type === 'public');
  const privateChannels = channels.filter((c: Channel) => c.type === 'private');
  const dmChannels = channels.filter((c: Channel) => c.type === 'dm');

  // Deduplicate DM channels - keep only one DM per unique user pair
  const uniqueDMChannels = dmChannels.reduce((acc: Channel[], channel: Channel) => {
    const otherUserId = channel.members.find((m) => m.userId !== user?.id)?.userId;
    if (otherUserId) {
      // Check if we already have a DM with this user
      const existingDM = acc.find((dm) => {
        const existingOtherUserId = dm.members.find((m) => m.userId !== user?.id)?.userId;
        return existingOtherUserId === otherUserId;
      });
      
      // If no existing DM with this user, add it
      if (!existingDM) {
        acc.push(channel);
      }
    }
    return acc;
  }, []);

  // Get members not in DM yet
  const dmUserIds = uniqueDMChannels.flatMap((c: Channel) => c.members.map((m) => m.userId));
  const availableForDM = workspaceMembers.filter(
    (m: any) => m.userId !== user?.id && !dmUserIds.includes(m.userId)
  );

  // Helper function to get DM display name
  const getDMDisplayName = (channel: Channel) => {
    // Find the other user in the DM (not the current user)
    const otherUserId = channel.members.find((m) => m.userId !== user?.id)?.userId;
    if (otherUserId) {
      const otherMember = workspaceMembers.find((m: any) => m.userId === otherUserId);
      if (otherMember) {
        return otherMember.user.name;
      }
    }
    return channel.name; // Fallback to channel name
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Channels</h3>
          {canCreateChannel && (
            <Button size="sm" onClick={onCreateChannel}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Public Channels */}
        {publicChannels.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Public Channels
            </h4>
            <div className="space-y-1">
              {publicChannels.map((channel: Channel) => {
                const isActive = channel.id === activeChannelId;
                const isMemberOfChannel = isMember(channel);

                return (
                  <div
                    key={channel.id}
                    className={`flex items-center justify-between group px-2 py-1.5 rounded cursor-pointer ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={() => isMemberOfChannel && onChannelSelect(channel.id)}
                    >
                      {getChannelIcon(channel.type)}
                      <span className="text-xs sm:text-sm font-medium truncate">{channel.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">({channel.members.length})</span>
                    </div>
                    {!isMemberOfChannel ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => joinChannelMutation.mutate(channel.id)}
                        loading={joinChannelMutation.isPending}
                        className="text-xs flex-shrink-0"
                      >
                        Join
                      </Button>
                    ) : canCreateChannel ? (
                      <button
                        onClick={() => deleteChannelMutation.mutate(channel.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Private Channels */}
        {privateChannels.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Private Channels
            </h4>
            <div className="space-y-1">
              {privateChannels.map((channel: Channel) => {
                const isActive = channel.id === activeChannelId;

                return (
                  <div
                    key={channel.id}
                    className={`flex items-center justify-between group px-2 py-1.5 rounded cursor-pointer ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => onChannelSelect(channel.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getChannelIcon(channel.type)}
                      <span className="text-xs sm:text-sm font-medium truncate">{channel.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">({channel.members.length})</span>
                    </div>
                    {canCreateChannel && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddMembersChannel(channel);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Add members"
                        >
                          <UserPlus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChannelMutation.mutate(channel.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Delete channel"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">
              Direct Messages
            </h4>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {showMembers ? 'Hide' : 'Show All'}
            </button>
          </div>
          <div className="space-y-1">
            {uniqueDMChannels.map((channel: Channel) => {
              const isActive = channel.id === activeChannelId;
              const displayName = getDMDisplayName(channel);

              return (
                <div
                  key={channel.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => onChannelSelect(channel.id)}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-medium truncate">{displayName}</span>
                </div>
              );
            })}

            {/* Show all workspace members when expanded */}
            {showMembers && availableForDM.length > 0 && (
              <>
                <div className="border-t border-gray-300 my-2"></div>
                {availableForDM.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-200 text-gray-700"
                    onClick={() => createDMMutation.mutate(member.userId)}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm font-medium truncate">{member.user.name}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Members Modal */}
      {addMembersChannel && (
        <AddMembersModal
          isOpen={!!addMembersChannel}
          onClose={() => setAddMembersChannel(null)}
          workspaceId={workspaceId}
          channelId={addMembersChannel.id}
          channelName={addMembersChannel.name}
          currentMembers={addMembersChannel.members}
        />
      )}
    </div>
  );
}

