'use client';

import { useQuery } from '@tanstack/react-query';
import { workspaceAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Briefcase, CheckCircle, Target, Users } from 'lucide-react';

export function QuickStats() {
  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await workspaceAPI.getAll();
      return response.data;
    },
  });

  const totalWorkspaces = workspaces?.length || 0;
  const totalTasks = workspaces?.reduce((sum: number, w: any) => sum + (w._count?.tasks || 0), 0) || 0;
  const totalMilestones = workspaces?.reduce((sum: number, w: any) => sum + (w._count?.milestones || 0), 0) || 0;
  
  // Calculate total team members across all workspaces
  const totalMembers = workspaces?.reduce((sum: number, w: any) => sum + (w.members?.length || 0), 0) || 0;

  const stats = [
    {
      label: 'Workspaces',
      value: totalWorkspaces,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Milestones',
      value: totalMilestones,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Team Members',
      value: totalMembers,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
