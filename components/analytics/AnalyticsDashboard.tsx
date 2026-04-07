'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Target, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { analyticsAPI } from '@/lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function AnalyticsDashboard({ workspaceId }: { workspaceId: string }) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', workspaceId],
    queryFn: async () => {
      const response = await analyticsAPI.getWorkspaceAnalytics(workspaceId);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">No analytics data available</div>
      </div>
    );
  }

  const taskStatusData = Object.entries(analytics.tasks.byStatus || {}).map(([status, count]) => ({
    name: status.replace('-', ' ').toUpperCase(),
    value: count as number,
  }));

  const teamPerformanceData = analytics.team?.map((member: any) => ({
    name: member.userName,
    completed: member.tasksCompleted,
    inProgress: member.tasksInProgress,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Task Completion</h4>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {analytics.tasks.completionPercentage.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.tasks.completed} of {analytics.tasks.total} tasks
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Overdue Tasks</h4>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.tasks.overdue}</p>
          <p className="text-xs text-gray-500 mt-1">Require attention</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Milestones</h4>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {analytics.milestones.achieved}/{analytics.milestones.total}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.milestones.overdue} overdue
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Team Members</h4>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.team?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Active contributors</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Task Status Distribution */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Task Status Distribution</h3>
          </div>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-600">No task data available</p>
            </div>
          )}
        </Card>

        {/* Team Performance */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
          </div>
          {teamPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-600">No team data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Progress Insights */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Insights</h3>
        <div className="space-y-3">
          {analytics.tasks.completionPercentage >= 70 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Great Progress!</p>
                <p className="text-sm text-green-700">
                  Your team has completed {analytics.tasks.completionPercentage.toFixed(0)}% of tasks. Keep up the momentum!
                </p>
              </div>
            </div>
          )}
          
          {analytics.tasks.overdue > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Attention Needed</p>
                <p className="text-sm text-red-700">
                  You have {analytics.tasks.overdue} overdue task{analytics.tasks.overdue > 1 ? 's' : ''}. Consider reprioritizing or reassigning.
                </p>
              </div>
            </div>
          )}

          {analytics.milestones.overdue > 0 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <Target className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900">Milestone Alert</p>
                <p className="text-sm text-yellow-700">
                  {analytics.milestones.overdue} milestone{analytics.milestones.overdue > 1 ? 's are' : ' is'} overdue. Review your timeline.
                </p>
              </div>
            </div>
          )}

          {analytics.tasks.completionPercentage < 30 && analytics.tasks.total > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Getting Started</p>
                <p className="text-sm text-blue-700">
                  Focus on completing high-priority tasks to build momentum for your team.
                </p>
              </div>
            </div>
          )}

          {analytics.tasks.completionPercentage >= 30 && 
           analytics.tasks.completionPercentage < 70 && 
           analytics.tasks.overdue === 0 && 
           analytics.milestones.overdue === 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Steady Progress</p>
                <p className="text-sm text-blue-700">
                  Your team is making good progress. Continue focusing on high-priority tasks to reach your goals.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
