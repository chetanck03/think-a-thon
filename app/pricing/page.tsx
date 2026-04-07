'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Sparkles, Zap, Crown, Rocket, Star, TrendingUp, Shield, Code, Database, Cpu, Globe, X, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

export default function PricingPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activeTab, setActiveTab] = useState<'plans' | 'api'>('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleBackClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      yearlyPrice: 0,
      description: 'Startups & Small Teams',
      subtitle: 'Perfect for getting started',
      icon: Sparkles,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Basic surveys (up to 5 active)',
        '100 responses/month',
        'Basic analytics',
        'Email support',
        '1 AI Sarthi query/day',
        'Up to 10 users',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Starter',
      price: 49,
      yearlyPrice: 490,
      description: 'Growing Startups',
      subtitle: '10-50 employees',
      icon: Rocket,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Unlimited surveys',
        '1,000 responses/month',
        'Advanced analytics',
        'Team collaboration (basic)',
        'Task management (50 tasks)',
        '50 AI Sarthi queries/month',
        'Priority email support',
        'Custom branding',
      ],
      cta: 'Start 14-Day Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: 199,
      yearlyPrice: 1990,
      description: 'Mid-size Companies',
      subtitle: '50-200 employees',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500',
      features: [
        'Everything in Starter',
        'Unlimited responses',
        'Advanced team collaboration',
        'Unlimited task management',
        '500 AI Sarthi queries/month',
        'All AI Sarthi tools',
        '2 Founder Academy courses/month',
        'Priority chat support',
        'Custom integrations',
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
      badge: 'MOST POPULAR',
    },
    {
      name: 'Enterprise',
      price: 599,
      yearlyPrice: 5990,
      description: 'Large Organizations',
      subtitle: '200+ employees',
      icon: Crown,
      gradient: 'from-indigo-500 to-purple-600',
      features: [
        'Everything in Professional',
        'Unlimited AI Sarthi queries',
        'Dedicated account manager',
        'Custom integrations',
        'SSO & advanced security',
        'Unlimited Founder Academy',
        'White-label options',
        '24/7 phone support',
        'SLA guarantees',
        'On-premise deployment',
      ],
      cta: 'Contact Sales',
      popular: false,
      badge: 'ENTERPRISE',
    },
  ];

  const apiPlans = [
    {
      name: 'Basic API',
      price: 99,
      yearlyPrice: 990,
      description: 'For developers getting started',
      icon: Code,
      gradient: 'from-green-500 to-emerald-500',
      features: [
        '10,000 API calls/month',
        'Standard rate limits',
        'REST API access',
        'Basic documentation',
        'Email support',
        '99.5% uptime SLA',
      ],
      specs: {
        calls: '10K',
        rateLimit: '100/min',
        support: 'Email',
      },
      cta: 'Get API Key',
      popular: false,
    },
    {
      name: 'Pro API',
      price: 299,
      yearlyPrice: 2990,
      description: 'For production applications',
      icon: Database,
      gradient: 'from-blue-500 to-indigo-500',
      features: [
        '100,000 API calls/month',
        'Higher rate limits',
        'REST + GraphQL API',
        'Advanced documentation',
        'Priority support',
        '99.9% uptime SLA',
        'Webhook support',
        'Custom endpoints',
      ],
      specs: {
        calls: '100K',
        rateLimit: '500/min',
        support: 'Priority',
      },
      cta: 'Get API Key',
      popular: true,
      badge: 'RECOMMENDED',
    },
    {
      name: 'Enterprise API',
      price: 'Custom',
      yearlyPrice: 'Custom',
      description: 'For large-scale integrations',
      icon: Cpu,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Unlimited API calls',
        'No rate limits',
        'REST + GraphQL + WebSocket',
        'Dedicated support engineer',
        'Custom SLA',
        '99.99% uptime guarantee',
        'Advanced webhooks',
        'Custom integrations',
        'White-label API',
        'On-premise option',
      ],
      specs: {
        calls: 'Unlimited',
        rateLimit: 'Custom',
        support: 'Dedicated',
      },
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const addOns = [
    {
      name: 'AI Query Pack - Small',
      price: 19,
      description: '100 extra AI queries',
      icon: Star,
    },
    {
      name: 'AI Query Pack - Medium',
      price: 79,
      description: '500 extra AI queries',
      icon: TrendingUp,
    },
    {
      name: 'AI Query Pack - Large',
      price: 149,
      description: '1,000 extra AI queries',
      icon: Rocket,
    },
    {
      name: 'Founder Academy Standalone',
      price: 29,
      description: 'Full course library access',
      icon: Globe,
    },
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setIsCheckoutOpen(true);
  };

  const getPrice = (plan: any) => {
    if (typeof plan.price === 'string') return plan.price;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
    return price === 0 ? 'Free' : `$${price}`;
  };

  const getSavings = (plan: any) => {
    if (typeof plan.price === 'string' || plan.price === 0) return null;
    const monthlyCost = plan.price * 12;
    const savings = monthlyCost - plan.yearlyPrice;
    return Math.round((savings / monthlyCost) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">
              {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2 mb-6">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">14-Day Free Trial • No Credit Card Required</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Pricing That Scales
            <br />
            With Your Dreams
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From solo founders to enterprise teams, we've got the perfect plan to supercharge your startup journey with AI-powered tools.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-1.5">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'plans'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'api'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              API Access
            </button>
          </div>
        </div>

        {/* Billing Toggle (only for plans) */}
        {activeTab === 'plans' && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-1.5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-slate-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        {activeTab === 'plans' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const savings = getSavings(plan);
              return (
                <div
                  key={plan.name}
                  className={`relative group ${
                    plan.popular ? 'lg:scale-105 z-10' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <span className={`bg-gradient-to-r ${plan.gradient} text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className={`relative h-full bg-slate-800/50 backdrop-blur-sm border-2 ${
                    plan.popular ? 'border-purple-500' : 'border-slate-700'
                  } rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    plan.popular ? 'shadow-2xl shadow-purple-500/20' : ''
                  }`}>
                    {/* Icon with Gradient */}
                    <div className={`inline-flex p-4 bg-gradient-to-br ${plan.gradient} rounded-2xl mb-6 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-1">{plan.description}</p>
                    <p className="text-gray-500 text-xs mb-6">{plan.subtitle}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">{getPrice(plan)}</span>
                        {typeof plan.price === 'number' && plan.price > 0 && (
                          <span className="text-gray-400">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && savings && (
                        <p className="text-green-400 text-sm mt-2 font-medium">
                          Save ${plan.price * 12 - plan.yearlyPrice}/year
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.name)}
                      className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular
                          ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {apiPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative group ${
                    plan.popular ? 'lg:scale-105 z-10' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <span className={`bg-gradient-to-r ${plan.gradient} text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className={`relative h-full bg-slate-800/50 backdrop-blur-sm border-2 ${
                    plan.popular ? 'border-blue-500' : 'border-slate-700'
                  } rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    plan.popular ? 'shadow-2xl shadow-blue-500/20' : ''
                  }`}>
                    {/* Icon */}
                    <div className={`inline-flex p-4 bg-gradient-to-br ${plan.gradient} rounded-2xl mb-6 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">
                          {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                        </span>
                        {typeof plan.price === 'number' && (
                          <span className="text-gray-400">/month</span>
                        )}
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-slate-900/50 rounded-xl">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">API Calls</p>
                        <p className="text-sm font-bold text-white">{plan.specs.calls}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Rate Limit</p>
                        <p className="text-sm font-bold text-white">{plan.specs.rateLimit}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Support</p>
                        <p className="text-sm font-bold text-white">{plan.specs.support}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.name)}
                      className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular
                          ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* Add-ons Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4">Power-Ups & Add-Ons</h2>
            <p className="text-gray-400 text-lg">Supercharge your plan with additional features</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => {
              const Icon = addon.icon;
              return (
                <div
                  key={addon.name}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-purple-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{addon.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{addon.description}</p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">${addon.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <button className="w-full py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium">
                    Add to Plan
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400">Uptime SLA</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400">Support</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">SOC 2</div>
                <div className="text-gray-400">Certified</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Absolutely! Upgrade or downgrade anytime. Changes take effect immediately with prorated billing.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All paid plans include a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'What happens after the trial?',
                a: "You'll be prompted to add payment info. You can also downgrade to our free plan anytime.",
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes! We offer a 30-day money-back guarantee on all annual plans. No questions asked.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, cancel anytime with no penalties. Your access continues until the end of your billing period.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300"
              >
                <h3 className="font-bold text-white mb-3 text-lg">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/50">
                Schedule a Demo
              </button>
              <button className="px-8 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all duration-300">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={`Subscribe to ${selectedPlan}`}
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">
              <strong>Demo Mode:</strong> This is a demonstration. In production, this would integrate with Stripe or your payment processor.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button fullWidth disabled>
              Complete Payment (Demo)
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This is a demonstration. No actual payment will be processed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
