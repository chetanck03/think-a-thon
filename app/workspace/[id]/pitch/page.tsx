import { PitchGenerator } from '@/components/pitch/PitchGenerator';

export default async function PitchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Investor Pitch Generator</h2>
        <p className="text-gray-600 mt-1">Auto-generate your pitch deck from workspace data</p>
      </div>
      <PitchGenerator workspaceId={id} />
    </div>
  );
}
