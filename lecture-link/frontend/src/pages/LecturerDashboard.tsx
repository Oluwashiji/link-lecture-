import { useEffect, useState } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  TrendingUp,
  Eye,
  Plus,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Material } from '@/types';
import { materialService, analyticsService } from '@/services/api';
import { toast } from 'sonner';

export function LecturerDashboard() {
  const [myMaterials, setMyMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const statsData = await analyticsService.getLecturerStats();
      setMyMaterials(statsData.materials.slice(0, 5));
      setStats({
        totalUploads: statsData.totalUploads,
        totalDownloads: statsData.totalDownloads
      });
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await materialService.deleteMaterial(id);
      toast.success('Material deleted successfully');
      loadDashboardData();
    } catch (error: any) {
      toast.error('Failed to delete material');
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

  const statCards = [
    { label: 'Total Uploads', value: stats.totalUploads, icon: Upload, color: 'bg-blue-500' },
    { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'bg-green-500' },
    { label: 'Avg Downloads/File', value: stats.totalUploads > 0 ? Math.round(stats.totalDownloads / stats.totalUploads) : 0, icon: BarChart3, color: 'bg-purple-500' },
    { label: 'This Month', value: myMaterials.filter(m => {
      const date = new Date(m.createdAt || '');
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length, icon: TrendingUp, color: 'bg-orange-500' }
  ];

  return (
    <DashboardLayout 
      title="Lecturer Dashboard" 
      subtitle="Manage your course materials and track engagement."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#012060] mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Materials */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">My Materials</CardTitle>
              <Button 
                size="sm"
                onClick={() => navigate('/upload')}
                className="bg-[#0158fe] hover:bg-[#012060]"
              >
                <Plus className="mr-2 w-4 h-4" />
                Upload New
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0158fe]"></div>
                </div>
              ) : myMaterials.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No materials yet</h3>
                  <p className="text-gray-500 mb-4">Start uploading your lecture materials</p>
                  <Button 
                    onClick={() => navigate('/upload')}
                    className="bg-[#0158fe] hover:bg-[#012060]"
                  >
                    <Upload className="mr-2 w-4 h-4" />
                    Upload Material
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myMaterials.map((material) => (
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
                            {material.courseCode} • {formatFileSize(material.fileSize)} • {material.downloadCount} downloads
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/resources?id=${material.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(material.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Progress */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Upload Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-2">
                {[...Array(7)].map((_, i) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-[#0158fe]/20 rounded-t-lg relative overflow-hidden"
                        style={{ height: `${height}%` }}
                      >
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-[#0158fe] rounded-t-lg transition-all duration-500"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
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
                onClick={() => navigate('/upload')}
              >
                <Upload className="mr-2 w-4 h-4" />
                Upload Material
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/resources')}
              >
                <Eye className="mr-2 w-4 h-4" />
                View All Materials
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/courses')}
              >
                <BarChart3 className="mr-2 w-4 h-4" />
                Manage Courses
              </Button>
            </CardContent>
          </Card>

          {/* Top Performing */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Performing</CardTitle>
            </CardHeader>
            <CardContent>
              {myMaterials.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {myMaterials
                    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
                    .slice(0, 3)
                    .map((material, index) => (
                      <div key={material.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#012060] truncate">{material.title}</p>
                          <p className="text-sm text-gray-500">{material.downloadCount} downloads</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-[#0158fe] to-[#012060] text-white">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Pro Tip</h3>
              <p className="text-white/80 text-sm mb-4">
                Upload materials at the beginning of each week to maximize student engagement.
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate('/upload')}
              >
                Upload Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
