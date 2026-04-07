'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CheckSquare, Target, MessageSquare, BarChart3, Sparkles, FileText, MessageCircle, Users } from 'lucide-react';

export function WorkspaceTabs({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/workspace/${workspaceId}`, label: 'Overview', icon: LayoutDashboard },
    { href: `/workspace/${workspaceId}/tasks`, label: 'Tasks', icon: CheckSquare },
    { href: `/workspace/${workspaceId}/milestones`, label: 'Milestones', icon: Target },
    { href: `/workspace/${workspaceId}/team`, label: 'Team', icon: Users },
    { href: `/workspace/${workspaceId}/chat`, label: 'Chat', icon: MessageCircle, badge: 'LIVE' },
    { href: `/workspace/${workspaceId}/feedback`, label: 'Feedback', icon: MessageSquare },
    { href: `/workspace/${workspaceId}/analytics`, label: 'Analytics', icon: BarChart3 },
    { href: `/workspace/${workspaceId}/insights`, label: 'AI Insights', icon: Sparkles, badge: 'NEW' },
    { href: `/workspace/${workspaceId}/pitch`, label: 'Pitch', icon: FileText, badge: 'BETA' },
  ];

  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <nav className="flex gap-4 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap',
                isActive
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  tab.badge === 'LIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
