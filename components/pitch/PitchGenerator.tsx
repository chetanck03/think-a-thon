'use client';

import { useMutation } from '@tanstack/react-query';
import { aiAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Copy, Download, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function PitchGenerator({ workspaceId }: { workspaceId: string }) {
  const [copied, setCopied] = useState(false);
  const [pitch, setPitch] = useState('');

  const generateMutation = useMutation({
    mutationFn: () => aiAPI.generatePitch(workspaceId),
    onSuccess: (response) => {
      setPitch(response.data.pitch);
    },
    onError: (error: any) => {
      console.error('Failed to generate pitch:', error);
      alert('Failed to generate pitch deck. Please make sure GEMINI_API_KEY is set in your .env file.');
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pitch], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitch-deck-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-none">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">AI-Generated Pitch Deck</h3>
            <p className="text-xs sm:text-sm text-gray-700 mb-4">
              Generate a professional investor pitch deck using Google Gemini AI. Based on your workspace data, traction metrics, and milestones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGenerate} 
                loading={generateMutation.isPending}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {pitch ? 'Regenerate Pitch' : 'Generate Pitch'}
              </Button>
              {pitch && (
                <>
                  <Button onClick={handleCopy} variant="outline" className="w-full sm:w-auto">
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {!pitch && !generateMutation.isPending && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Create Your Investor Pitch</h4>
            <p className="text-sm text-gray-700 mb-4">
              Click "Generate Pitch" to create a professional pitch deck powered by AI.
            </p>
          </div>
        </Card>
      )}

      {pitch && (
        <>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pitch Preview</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 sm:p-6 rounded-lg text-xs sm:text-sm text-gray-800 font-mono overflow-x-auto">
                {pitch}
              </pre>
            </div>
          </Card>

          <Card className="bg-blue-50 border-none">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Next Steps</h4>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• Customize the pitch with your unique value proposition</li>
              <li>• Add specific market data and competitive analysis</li>
              <li>• Include financial projections and funding requirements</li>
              <li>• Create visual slides using tools like Pitch, Canva, or PowerPoint</li>
              <li>• Practice your delivery and get feedback from mentors</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
