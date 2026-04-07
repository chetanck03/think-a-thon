'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceAPI } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDUSTRY_OPTIONS = [
  'SaaS',
  'E-commerce',
  'FinTech',
  'HealthTech',
  'EdTech',
  'AI/ML',
  'Blockchain',
  'Gaming',
  'Social Media',
  'Marketplace',
  'Enterprise Software',
  'Mobile Apps',
  'IoT',
  'Cybersecurity',
  'Other',
];

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => workspaceAPI.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      onClose();
      router.push(`/workspace/${response.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, description, industry });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Startup"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your startup..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            <option value="">Select an industry</option>
            {INDUSTRY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={createMutation.isPending}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}
