import { TeamMembers } from '@/components/workspace/TeamMembers';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Team</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your workspace members and permissions</p>
      </div>
      <TeamMembers workspaceId={id} />
    </div>
  );
}
