import { FeedbackDashboard } from '@/components/feedback/FeedbackDashboard';

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
        <p className="text-gray-600 mt-1">Collect and analyze feedback</p>
      </div>
      <FeedbackDashboard workspaceId={id} />
    </div>
  );
}
