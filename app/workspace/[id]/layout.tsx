import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { WorkspaceMobileMenu } from '@/components/workspace/WorkspaceMobileMenu';
import Link from 'next/link';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <>
      {/* Mobile Navbar - Only visible on mobile, replaces the parent Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <WorkspaceMobileMenu workspaceId={id} />
              <Link href="/dashboard" className="text-xl font-bold">
                <span className="text-blue-600">Startup</span>
                <span className="text-gray-900">Ops</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <WorkspaceSidebar workspaceId={id} />
      
      {/* Main Content */}
      <div className="pt-24 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <WorkspaceHeader workspaceId={id} />
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
