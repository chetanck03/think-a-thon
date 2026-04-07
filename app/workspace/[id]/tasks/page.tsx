import { TaskBoard } from '@/components/tasks/TaskBoard';

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <p className="text-gray-600 mt-1">Manage and track your tasks</p>
      </div>
      <TaskBoard workspaceId={id} />
    </div>
  );
}
