import { useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  FolderOpen,
  Upload,
  Search,
  Users,
  BookMarked,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isCollapsed, onToggle, isMobile = false }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (path: string) => {
    setCurrentPath(path);
    (window as any).navigate(path);
    if (isMobile) onToggle();
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    (window as any).navigate('/login');
  };

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['student', 'lecturer', 'admin'] },
    { label: 'Resources',  icon: FolderOpen,      href: '/resources',  roles: ['student', 'lecturer', 'admin'] },
    { label: 'Search',     icon: Search,           href: '/search',     roles: ['student', 'lecturer', 'admin'] },
    { label: 'Upload',     icon: Upload,           href: '/upload',     roles: ['lecturer', 'admin'] },
    { label: 'Courses',    icon: BookMarked,       href: '/courses',    roles: ['lecturer', 'admin'] },
    { label: 'Users',      icon: Users,            href: '/users',      roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => hasRole(item.roles as any));

  // Desktop sidebar uses fixed positioning
  // Mobile sidebar uses relative so parent div's transform controls the slide
  const asideStyle = isMobile
    ? {
        position: 'relative' as const,
        top: 0,
        left: 0,
        height: '100vh',
        width: '256px',
        backgroundColor: '#012060',
        color: 'white',
        display: 'flex',
        flexDirection: 'column' as const,
        zIndex: 50,
      }
    : {};

  return (
    <aside
      style={isMobile ? asideStyle : {}}
      className={
        isMobile
          ? ''
          : `fixed left-0 top-0 h-full bg-[#012060] text-white transition-all duration-300 z-50 ${
              isCollapsed ? 'w-20' : 'w-64'
            }`
      }
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
        <div
          className={`flex items-center gap-3 cursor-pointer ${isCollapsed ? 'justify-center w-full' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-10 h-10 bg-[#0158fe] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#ffffff',
              letterSpacing: '0.02em'
            }}>
              LECTURE-LINK
            </span>
          )}
        </div>

        {/* X on mobile, ChevronLeft on desktop */}
        {!isCollapsed && (
          <button
            onClick={onToggle}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'white' }}
          >
            {isMobile
              ? <X className="w-5 h-5" />
              : <ChevronLeft className="w-5 h-5" />
            }
          </button>
        )}
      </div>

      {/* Desktop expand button when collapsed */}
      {isCollapsed && !isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-24 w-6 h-6 bg-[#0158fe] rounded-full flex items-center justify-center shadow-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <button
            key={item.href}
            onClick={() => navigate(item.href)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              isActive(item.href)
                ? 'bg-[#0158fe] text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        {!isCollapsed && (
          <div className="mb-4 px-3 py-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0158fe] rounded-full flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate" style={{ color: 'white' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          style={{ color: 'rgba(255,255,255,0.7)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
