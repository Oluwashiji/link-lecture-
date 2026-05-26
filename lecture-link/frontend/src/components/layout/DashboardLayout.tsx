import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) setMobileMenuOpen(false);
  }, [isDesktop]);


  return (
    <div className="min-h-screen bg-[#f8f9ff]">

      {isDesktop ? (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={false}
        />
      ) : (
        <>
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100%',
              zIndex: 50,
              transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            <Sidebar
              isCollapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              isMobile={true}
            />
          </div>
        </>
      )}

      <main
        style={{
          marginLeft: isDesktop ? (sidebarCollapsed ? '80px' : '256px') : '0px',
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">

              {/* Left: hamburger + title */}
              <div className="flex items-center gap-3 min-w-0">
                {!isDesktop && (
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                  >
                    <Menu className="w-5 h-5 text-[#012060]" />
                  </button>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-[#012060] truncate">{title}</h1>
                  {subtitle && (
                    <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Right: bell + avatar */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <Button variant="ghost" size="icon" className="relative w-9 h-9">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
                <div className="w-9 h-9 bg-[#0158fe] rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
