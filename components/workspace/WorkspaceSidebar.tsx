'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
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
import { useAuthStore } from '@/lib/stores/authStore';

export function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
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
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] hidden md:flex md:flex-col fixed top-16 left-0 z-20">
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {/* Back to Home Button */}
        <Link
          href="/dashboard"
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
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition text-red-600 hover:bg-red-50 w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
