import { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Download,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Activity
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats } from '@/types';
import { analyticsService } from '@/services/api';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = (path: string) => {
    (window as any).navigate(path);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', subtext: `${stats.totalStudents} students, ${stats.totalLecturers} lecturers` },
    { label: 'Total Materials', value: stats.totalMaterials, icon: FileText, color: 'bg-green-500', subtext: 'Across all courses' },
    { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'bg-purple-500', subtext: 'All time downloads' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'bg-orange-500', subtext: 'Active courses' }
  ] : [];

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="System overview and management."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#012060] mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Uploads */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Uploads</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/resources')}
                className="text-[#0158fe]"
              >
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0158fe]"></div>
                </div>
              ) : stats?.recentUploads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No uploads yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentUploads.slice(0, 5).map((material) => (
                    <div 
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0158fe]/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#0158fe]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#012060]">{material.title}</h4>
                          <p className="text-sm text-gray-500">
                            {material.courseCode} • {formatFileSize(material.fileSize)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(material.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Materials */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Most Downloaded Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0158fe]"></div>
                </div>
              ) : stats?.popularMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No download data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.popularMaterials.slice(0, 5).map((material, index) => (
                    <div 
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#012060]">{material.title}</h4>
                          <p className="text-sm text-gray-500">{material.courseCode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Download className="w-4 h-4" />
                        <span>{material.downloadCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-[#0158fe] hover:bg-[#012060]"
                onClick={() => navigate('/users')}
              >
                <UserPlus className="mr-2 w-4 h-4" />
                Add New User
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/courses')}
              >
                <BookOpen className="mr-2 w-4 h-4" />
                Manage Courses
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/resources')}
              >
                <FileText className="mr-2 w-4 h-4" />
                View All Materials
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/upload')}
              >
                <Activity className="mr-2 w-4 h-4" />
                System Activity
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">System Load</span>
                  <span className="font-medium">24%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Stats */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-[#0158fe] to-[#012060] text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="font-semibold">Growth This Month</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">New Users</span>
                  <span className="font-bold">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Uploads</span>
                  <span className="font-bold">+28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Downloads</span>
                  <span className="font-bold">+45%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
