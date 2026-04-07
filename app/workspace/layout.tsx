import { Navbar } from '@/components/layout/Navbar';

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hide Navbar on mobile, show on desktop */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      {children}
    </div>
  );
}
