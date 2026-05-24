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
