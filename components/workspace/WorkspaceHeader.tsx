'use client';

import { useQuery } from '@tanstack/react-query';
import { workspaceAPI } from '@/lib/api';
import { Briefcase } from 'lucide-react';

export function WorkspaceHeader({ workspaceId }: { workspaceId: string }) {
  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const response = await workspaceAPI.getById(workspaceId);
      return response.data;
    },
  });

  if (!workspace) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Briefcase className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
      </div>
      {workspace.description && (
        <p className="text-gray-600">{workspace.description}</p>
      )}
    </div>
  );
}
