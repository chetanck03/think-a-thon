import { AIInsights } from '@/components/ai/AIInsights';

export default async function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
        <p className="text-gray-600 mt-1">Smart recommendations to accelerate your startup</p>
      </div>
      <AIInsights workspaceId={id} />
    </div>
  );
}
