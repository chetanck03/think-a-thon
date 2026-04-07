'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageSquare, Star, CheckCircle2, Home } from 'lucide-react';
import { feedbackAPI } from '@/lib/api';
import { use } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicFeedbackPage({ params }: { params: Promise<{ link: string }> }) {
  const { link } = use(params);
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackRequest, setFeedbackRequest] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const fetchFeedbackRequest = async () => {
      try {
        const response = await feedbackAPI.getFeedbackRequest(link);
        setFeedbackRequest(response.data);
      } catch (error) {
        console.error('Failed to load feedback request:', error);
      } finally {
        setLoadingRequest(false);
      }
    };

    fetchFeedbackRequest();
  }, [link]);

  // Countdown timer for redirect after submission
  useEffect(() => {
    if (submitted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (submitted && countdown === 0) {
      router.push('/');
    }
  }, [submitted, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await feedbackAPI.submitFeedback(link, {
        content,
        rating: rating || undefined,
        submitterName: submitterName || undefined,
        submitterEmail: submitterEmail || undefined,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!feedbackRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-600">This feedback request does not exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Redirecting to home page in <span className="font-semibold text-blue-600">{countdown}</span> seconds...
            </p>
            
            <Button 
              onClick={() => router.push('/')}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Home Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{feedbackRequest.title}</h1>
            {feedbackRequest.description && (
              <p className="text-gray-600 mt-1">{feedbackRequest.description}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Your Name (Optional)"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="John Doe"
            />
            <Input
              label="Your Email (Optional)"
              type="email"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Your Experience (Optional)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, suggestions, or concerns..."
              rows={6}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Submit Feedback
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Powered by StartupOps - Your feedback helps startups build better products
          </p>
        </div>
      </Card>
    </div>
  );
}
