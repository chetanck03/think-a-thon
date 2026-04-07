'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { channelsAPI } from '@/lib/api';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function CreateChannelModal({
  isOpen,
  onClose,
  workspaceId,
}: CreateChannelModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');

  const createChannelMutation = useMutation({
    mutationFn: async () => {
      return await channelsAPI.create({
        workspaceId,
        name,
        description,
        type,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', workspaceId] });
      setName('');
      setDescription('');
      setType('public');
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createChannelMutation.mutate();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Channel Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., general, announcements"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this channel about?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Channel Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="public"
                checked={type === 'public'}
                onChange={(e) => setType(e.target.value as 'public')}
                className="text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Public</div>
                <div className="text-sm text-gray-600">
                  Anyone in the workspace can join
                </div>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="private"
                checked={type === 'private'}
                onChange={(e) => setType(e.target.value as 'private')}
                className="text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">Private</div>
                <div className="text-sm text-gray-600">
                  Only invited members can join
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createChannelMutation.isPending}
            disabled={!name.trim()}
          >
            Create Channel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
