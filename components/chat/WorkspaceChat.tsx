'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Trash2, Edit2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';
import { ChannelMembers } from './ChannelMembers';
import { FileUpload } from './FileUpload';
import { MessageAttachments } from './MessageAttachments';

interface FileAttachment {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  size: number;
  fileName: string;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface Message {
  id: string;
  content: string;
  attachments?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Member {
  userId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface WorkspaceChatProps {
  workspaceId: string;
  channelId?: string;
  channelName?: string;
  channelType?: 'public' | 'private' | 'dm';
  channelMembers?: Member[];
}

export function WorkspaceChat({ workspaceId, channelId, channelName, channelType, channelMembers }: WorkspaceChatProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', workspaceId, channelId],
    queryFn: async () => {
      const params = channelId ? { channelId } : {};
      const response = await api.get(`/messages/workspace/${workspaceId}`, { params });
      return response.data;
    },
    enabled: !!channelId,
  });

  // Send message mutation with optimistic update
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments }: { content: string; attachments: FileAttachment[] }) => {
      return await api.post('/messages', { 
        workspaceId, 
        channelId, 
        content,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    },
    onMutate: async ({ content, attachments }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', workspaceId, channelId] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(['messages', workspaceId, channelId]);

      // Optimistically update with temporary message
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        attachments: attachments.length > 0 ? attachments : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: user?.id || '',
          name: user?.name || '',
          email: user?.email || '',
        },
      };

      queryClient.setQueryData(['messages', workspaceId, channelId], (old: Message[] = []) => {
        return [...old, tempMessage];
      });

      // Clear input and attachments immediately
      setMessage('');
      setAttachments([]);

      return { previousMessages, tempMessage };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', workspaceId, channelId], context.previousMessages);
      }
      // Restore message and attachments in input
      setMessage(variables.content);
      setAttachments(variables.attachments);
    },
    onSuccess: (response, variables, context) => {
      // Replace temp message with real message from server
      const realMessage = response.data;
      queryClient.setQueryData(['messages', workspaceId, channelId], (old: Message[] = []) => {
        return old.map((msg) => 
          msg.id === context?.tempMessage?.id ? realMessage : msg
        );
      });
    },
  });

  // Delete message mutation with optimistic update
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await api.delete(`/messages/${messageId}`);
    },
    onMutate: async (messageId: string) => {
      await queryClient.cancelQueries({ queryKey: ['messages', workspaceId, channelId] });
      const previousMessages = queryClient.getQueryData(['messages', workspaceId, channelId]);

      // Optimistically remove message
      queryClient.setQueryData(['messages', workspaceId, channelId], (old: Message[] = []) => {
        return old.filter((msg) => msg.id !== messageId);
      });

      return { previousMessages };
    },
    onError: (err, messageId, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', workspaceId, channelId], context.previousMessages);
      }
    },
  });

  // Update message mutation with optimistic update
  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return await api.put(`/messages/${id}`, { content });
    },
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', workspaceId, channelId] });
      const previousMessages = queryClient.getQueryData(['messages', workspaceId, channelId]);

      // Optimistically update message
      queryClient.setQueryData(['messages', workspaceId, channelId], (old: Message[] = []) => {
        return old.map((msg) =>
          msg.id === id
            ? { ...msg, content, updatedAt: new Date().toISOString() }
            : msg
        );
      });

      setEditingId(null);
      setEditContent('');

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', workspaceId, channelId], context.previousMessages);
      }
      // Restore editing state
      setEditingId(variables.id);
      setEditContent(variables.content);
    },
  });

  // Setup WebSocket
  useEffect(() => {
    if (!channelId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('join-channel', channelId);
    });

    newSocket.on('new-message', (newMessage: Message) => {
      queryClient.setQueryData(['messages', workspaceId, channelId], (old: Message[] = []) => {
        // Don't add if it's from current user (already added optimistically)
        if (newMessage.user.id === user?.id) {
          // Replace temp message with real one if exists
          const hasTempMessage = old.some((msg) => msg.id.startsWith('temp-'));
          if (hasTempMessage) {
            return old.map((msg) => 
              msg.id.startsWith('temp-') && msg.content === newMessage.content
                ? newMessage
                : msg
            );
          }
          // Check if real message already exists
          const exists = old.some((msg) => msg.id === newMessage.id);
          if (exists) {
            return old;
          }
        }
        
        // Check if message already exists (avoid duplicates)
        const exists = old.some((msg) => msg.id === newMessage.id);
        if (exists) {
          return old;
        }
        
        // Add new message from other users
        return [...old, newMessage];
      });
    });

    newSocket.on('message-deleted', ({ id }: { id: string }) => {
      queryClient.setQueryData(['messages', workspaceId, channelId], (old: Message[] = []) => {
        return old.filter((msg) => msg.id !== id);
      });
    });

    newSocket.on('message-updated', (updatedMessage: Message) => {
      queryClient.setQueryData(['messages', workspaceId, channelId], (old: Message[] = []) => {
        return old.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg));
      });
    });

    newSocket.on('user-typing', ({ userName }: { userName: string }) => {
      setTypingUsers((prev) => [...new Set([...prev, userName])]);
    });

    newSocket.on('user-stopped-typing', ({ userName }: { userName: string }) => {
      setTypingUsers((prev) => prev.filter((name) => name !== userName));
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-channel', channelId);
      newSocket.disconnect();
    };
  }, [workspaceId, channelId, queryClient]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && channelId) {
      const messageToSend = message;
      const attachmentsToSend = [...attachments];
      sendMessageMutation.mutate({ content: messageToSend, attachments: attachmentsToSend });
      if (socket) {
        socket.emit('typing-stop', { channelId, userName: user?.name });
      }
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (socket && user && channelId) {
      socket.emit('typing-start', { channelId, userName: user.name });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', { channelId, userName: user.name });
      }, 1000);
    }
  };

  const handleEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleUpdate = () => {
    if (editContent.trim() && editingId) {
      updateMessageMutation.mutate({ id: editingId, content: editContent });
    }
  };

  if (!channelId) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Select a channel to start chatting</div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading chat...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Channel Header */}
      {channelName && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {channelType === 'dm' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {channelName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <span className="text-gray-600">#</span>
              )}
              <h3 className="font-semibold text-gray-900">{channelName}</h3>
            </div>
            {channelMembers && channelMembers.length > 0 && channelType !== 'dm' && (
              <ChannelMembers members={channelMembers} channelName={channelName} />
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isOwn = msg.user.id === user?.id;
            const isEditing = editingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isOwn && (
                    <span className="text-xs text-gray-600 mb-1">{msg.user.name}</span>
                  )}
                  
                  {isEditing ? (
                    <div className="w-full">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        rows={2}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={handleUpdate}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <MessageAttachments attachments={msg.attachments} />
                      )}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </span>
                        {isOwn && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(msg)}
                              className="hover:opacity-70"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteMessageMutation.mutate(msg.id)}
                              className="hover:opacity-70"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 italic">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        {attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                {file.mimeType.startsWith('image/') && (
                  <img src={file.url} alt={file.fileName} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-center">
          <FileUpload onFilesSelected={setAttachments} disabled={!channelId} />
          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
