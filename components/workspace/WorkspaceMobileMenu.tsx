'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  MessageCircle, 
  MessageSquare, 
  BarChart3, 
  Sparkles, 
  FileText, 
  Users,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/authStore';

export function WorkspaceMobileMenu({ workspaceId }: { workspaceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
  };

  const links = [
    { href: `/workspace/${workspaceId}`, label: 'Overview', icon: LayoutDashboard },
    { href: `/workspace/${workspaceId}/tasks`, label: 'Tasks', icon: CheckSquare },
    { href: `/workspace/${workspaceId}/milestones`, label: 'Milestones', icon: Target },
    { href: `/workspace/${workspaceId}/team`, label: 'Team', icon: Users },
    { href: `/workspace/${workspaceId}/chat`, label: 'Chat', icon: MessageCircle, badge: 'LIVE' },
    { href: `/workspace/${workspaceId}/feedback`, label: 'Feedback', icon: MessageSquare },
    { href: `/workspace/${workspaceId}/analytics`, label: 'Analytics', icon: BarChart3 },
    { href: `/workspace/${workspaceId}/insights`, label: 'AI Insights', icon: Sparkles, badge: 'NEW' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 md:hidden overflow-y-auto flex flex-col">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-xl font-bold">
                <span className="text-blue-600">Startup</span>
                <span className="text-gray-900">Ops</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {/* Back to Home Button */}
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-700 hover:bg-gray-50 mb-4 border-b border-gray-200 pb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>

              {/* Workspace Navigation */}
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                    {link.badge && (
                      <span className={cn(
                        'ml-auto text-xs px-2 py-0.5 rounded-full font-medium',
                        link.badge === 'LIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : link.badge === 'NEW'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      )}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
