'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { WorkspaceChat } from '@/components/chat/WorkspaceChat';
import { ChannelSidebar } from '@/components/chat/ChannelSidebar';
import { CreateChannelModal } from '@/components/chat/CreateChannelModal';
import { channelsAPI, workspaceMembersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';
import { Menu, X } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { user } = useAuthStore();
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ['channels', workspaceId],
    queryFn: async () => {
      const response = await channelsAPI.getByWorkspace(workspaceId);
      return response.data;
    },
  });

  // Fetch workspace members to check role
  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      const response = await workspaceMembersAPI.getMembers(workspaceId);
      return response.data;
    },
  });

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  const currentMember = members.find((m: any) => m.userId === user?.id);
  const canCreateChannel = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  const activeChannel = channels.find((c: any) => c.id === activeChannelId);

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  // Get display name for DM channels
  const getChannelDisplayName = () => {
    if (!activeChannel) return '';
    
    if (activeChannel.type === 'dm') {
      // Find the other user in the DM
      const otherUserId = activeChannel.members?.find((m: any) => m.userId !== user?.id)?.userId;
      if (otherUserId) {
        const otherMember = members.find((m: any) => m.userId === otherUserId);
        if (otherMember) {
          return otherMember.user.name;
        }
      }
    }
    
    return activeChannel.name;
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition text-gray-700"
            aria-label="Toggle channel list"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Team Chat</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {activeChannel ? (
                <span className="flex items-center gap-1">
                  {activeChannel.type === 'dm' ? '💬' : '#'} {getChannelDisplayName()}
                </span>
              ) : (
                'Real-time communication with your team'
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex h-[calc(100vh-200px)] sm:h-[600px] border border-gray-200 rounded-lg overflow-hidden">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div
          className={`
            fixed sm:relative inset-y-0 left-0 z-50 sm:z-0
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
            w-64 sm:w-64 h-full
          `}
        >
          <ChannelSidebar
            workspaceId={workspaceId}
            activeChannelId={activeChannelId}
            onChannelSelect={handleChannelSelect}
            onCreateChannel={() => setIsCreateModalOpen(true)}
            canCreateChannel={canCreateChannel}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 min-w-0">
          <WorkspaceChat
            workspaceId={workspaceId}
            channelId={activeChannelId}
            channelName={getChannelDisplayName()}
            channelType={activeChannel?.type}
            channelMembers={activeChannel?.members}
          />
        </div>
      </div>

      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
}
