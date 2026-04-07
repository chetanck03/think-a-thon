import Link from 'next/link';
import { ArrowRight, CheckCircle, BarChart3, Users, Target, Zap, Shield, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Startup</span>Ops
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-gray-700 font-medium hover:text-blue-600 transition rounded-lg hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Built for Early-Stage Founders
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Your Startup,
            <br />
            <span className="text-blue-600">All in One Place</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            A unified platform for early-stage founders to manage execution, validate ideas,
            collaborate with teams, and gain actionable insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition border-2 border-gray-200"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">No credit card required • Free forever plan</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for startup founders
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<CheckCircle className="w-10 h-10 text-blue-600" />}
              title="Task Management"
              description="Organize work with tasks and milestones to track progress efficiently"
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-blue-600" />}
              title="Team Collaboration"
              description="Work together with your team in real-time with seamless communication"
            />
            <FeatureCard
              icon={<Target className="w-10 h-10 text-blue-600" />}
              title="Feedback System"
              description="Collect and analyze feedback from stakeholders and customers"
            />
            <FeatureCard
              icon={<BarChart3 className="w-10 h-10 text-blue-600" />}
              title="Analytics"
              description="Data-driven insights on progress and performance metrics"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Fast Setup"
              description="Get started in minutes, not hours. No complex configuration needed."
            />
            <BenefitCard
              icon={<Shield className="w-8 h-8 text-green-500" />}
              title="Secure & Reliable"
              description="Enterprise-grade security with 99.9% uptime guarantee."
            />
            <BenefitCard
              icon={<Clock className="w-8 h-8 text-purple-500" />}
              title="Save Time"
              description="Automate workflows and focus on what matters most - building your product."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
              Join hundreds of founders managing their startups with StartupOps
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 text-lg font-bold rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              Create Free Account
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-sm mt-6 opacity-90">Start your 14-day free trial today</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-4">
              <span className="text-blue-600">Startup</span>Ops
            </div>
            <p className="text-gray-600 mb-6">
              Built for early-stage founders who want to move fast
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link href="/register" className="text-gray-600 hover:text-blue-600 transition">
                Sign Up
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2026 StartupOps. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition group">
      <div className="mb-5 transform group-hover:scale-110 transition">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
