'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { aiAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, TrendingUp, AlertTriangle, Target, Lightbulb, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface AIInsight {
  type: 'suggestion' | 'warning' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return AlertTriangle;
    case 'opportunity':
      return Zap;
    case 'recommendation':
      return Target;
    default:
      return Lightbulb;
  }
};

const getInsightColors = (type: string) => {
  switch (type) {
    case 'warning':
      return { color: 'text-red-600', bgColor: 'bg-red-50' };
    case 'opportunity':
      return { color: 'text-green-600', bgColor: 'bg-green-50' };
    case 'recommendation':
      return { color: 'text-purple-600', bgColor: 'bg-purple-50' };
    default:
      return { color: 'text-blue-600', bgColor: 'bg-blue-50' };
  }
};

export function AIInsights({ workspaceId }: { workspaceId: string }) {
  const [insights, setInsights] = useState<AIInsight[]>([]);

  const generateMutation = useMutation({
    mutationFn: () => aiAPI.generateInsights(workspaceId),
    onSuccess: (response) => {
      setInsights(response.data.insights);
    },
    onError: (error: any) => {
      console.error('Failed to generate insights:', error);
      alert('Failed to generate AI insights. Please make sure GEMINI_API_KEY is set in your .env file.');
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
            BETA
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleGenerate} 
            loading={generateMutation.isPending}
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {insights.length > 0 ? 'Regenerate' : 'Generate Insights'}
          </Button>
          <Button 
            onClick={() => window.open('https://sarthi-ai-crm-portal.netlify.app', '_blank')}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Alternative AI Portal
          </Button>
        </div>
      </div>

      {insights.length === 0 && !generateMutation.isPending && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-none">
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Get AI-Powered Insights</h4>
            <p className="text-sm text-gray-700 mb-4">
              Click "Generate Insights" to get personalized recommendations based on your workspace data.
            </p>
          </div>
        </Card>
      )}

      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const { color, bgColor } = getInsightColors(insight.type);
            
            return (
              <Card key={index} className={`${bgColor} border-none`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg flex-shrink-0">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${color} mb-1 text-sm sm:text-base`}>{insight.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-700">{insight.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-none">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm text-gray-700">
              <span className="font-semibold">Pro Tip:</span> These insights are generated using Google Gemini AI based on your workspace data. 
              Click "Regenerate" to get fresh perspectives.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
