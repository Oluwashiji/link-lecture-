import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navigate = (path: string) => {
    (window as any).navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff]">

      {/* Desktop Sidebar - only shows on lg screens and above */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={false}
        />
      </div>

      {/* Mobile dark overlay - tap anywhere to close */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar drawer - slides in from left */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          isCollapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">

              {/* Left Side */}
              <div className="flex items-center gap-4">
                {/* Hamburger - only visible on mobile */}
                <button
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6 text-[#012060]" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#012060]">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-500 hidden sm:block">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center relative">
                  <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Quick search..."
                    className="pl-10 w-64"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/search?q=${(e.target as HTMLInputElement).value}`);
                      }
                    }}
                  />
                </div>

                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>

                <div className="w-10 h-10 bg-[#0158fe] rounded-full flex items-center justify-center text-white font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
