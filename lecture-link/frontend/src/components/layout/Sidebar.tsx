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
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (path: string) => {
    setCurrentPath(path);
    (window as any).navigate(path);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['student', 'lecturer', 'admin']
    },
    {
      label: 'Resources',
      icon: FolderOpen,
      href: '/resources',
      roles: ['student', 'lecturer', 'admin']
    },
    {
      label: 'Search',
      icon: Search,
      href: '/search',
      roles: ['student', 'lecturer', 'admin']
    },
    {
      label: 'Upload',
      icon: Upload,
      href: '/upload',
      roles: ['lecturer', 'admin']
    },
    {
      label: 'Courses',
      icon: BookMarked,
      href: '/courses',
      roles: ['lecturer', 'admin']
    },
    {
      label: 'Users',
      icon: Users,
      href: '/users',
      roles: ['admin']
    }
  ];

  const filteredNavItems = navItems.filter(item => hasRole(item.roles as any));

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-[#012060] text-white transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
        <div 
          className={`flex items-center gap-3 cursor-pointer ${isCollapsed ? 'justify-center w-full' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-10 h-10 bg-[#0158fe] rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg">LECTURE-LINK</span>
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={onToggle}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Toggle button when collapsed */}
      {isCollapsed && (
        <button 
          onClick={onToggle}
          className="absolute -right-3 top-24 w-6 h-6 bg-[#0158fe] rounded-full flex items-center justify-center shadow-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
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

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        {/* User Info */}
        {!isCollapsed && (
          <div className="mb-4 px-3 py-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0158fe] rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-white/60 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
