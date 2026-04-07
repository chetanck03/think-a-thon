import { WorkspaceList } from '@/components/dashboard/WorkspaceList';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { CreateWorkspaceButton } from '@/components/workspace/CreateWorkspaceButton';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage your startup workspaces</p>
        </div>
        <CreateWorkspaceButton />
      </div>

      <QuickStats />
      
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Your Workspaces</h2>
        <WorkspaceList />
      </div>
    </div>
  );
}
