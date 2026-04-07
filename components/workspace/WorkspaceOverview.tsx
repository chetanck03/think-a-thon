'use client';

import { useQuery } from '@tanstack/react-query';
import { workspaceAPI, taskAPI, milestoneAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Target, Users, TrendingUp, Clock } from 'lucide-react';

export function WorkspaceOverview({ workspaceId }: { workspaceId: string }) {
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const response = await workspaceAPI.getById(workspaceId);
      return response.data;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: async () => {
      const response = await taskAPI.getByWorkspace(workspaceId);
      return response.data;
    },
    enabled: !!workspaceId,
  });

  const { data: milestones } = useQuery({
    queryKey: ['milestones', workspaceId],
    queryFn: async () => {
      const response = await milestoneAPI.getByWorkspace(workspaceId);
      return response.data;
    },
    enabled: !!workspaceId,
  });

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading workspace...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600">Workspace not found</p>
        </div>
      </div>
    );
  }

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t: any) => t.status === 'done').length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const teamMembers = workspace.members?.length || 0;
  const totalMilestones = milestones?.length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
              <p className="text-xs text-gray-500 mt-1">{completedTasks} completed</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Milestones</p>
              <p className="text-3xl font-bold text-gray-900">{totalMilestones}</p>
              <p className="text-xs text-gray-500 mt-1">Active goals</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{teamMembers}</p>
              <p className="text-xs text-gray-500 mt-1">Collaborators</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-3xl font-bold text-gray-900">{progress}%</p>
              <p className="text-xs text-gray-500 mt-1">Completion rate</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tasks Completed</span>
            <span>{completedTasks} / {totalTasks}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        
        {tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'in-progress' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{task.status.replace('-', ' ')}</p>
                </div>
                {task.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Create tasks to see activity here</p>
          </div>
        )}
      </Card>

      {/* Workspace Info */}
      {workspace.description && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Workspace</h3>
          <p className="text-gray-600">{workspace.description}</p>
        </Card>
      )}
    </div>
  );
}
