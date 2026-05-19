import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Download, 
  Search, 
  Clock, 
  TrendingUp,
  FileText,
  ArrowRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Material, Course } from '@/types';
import { materialService, courseService } from '@/services/api';
import { toast } from 'sonner';

export function StudentDashboard() {
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [materialsData, coursesData] = await Promise.all([
        materialService.getAllMaterials(),
        courseService.getAllCourses()
      ]);
      setRecentMaterials(materialsData.slice(0, 5));
      setCourses(coursesData.slice(0, 6));
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      await materialService.downloadMaterial(material.id, material.originalName);
      toast.success('Download started!');
    } catch (error: any) {
      toast.error('Download failed');
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

  const stats = [
    { label: 'Total Downloads', value: '24', icon: Download, color: 'bg-blue-500' },
    { label: 'Courses', value: courses.length.toString(), icon: BookOpen, color: 'bg-green-500' },
    { label: 'Resources', value: recentMaterials.length.toString(), icon: FileText, color: 'bg-purple-500' },
    { label: 'Last Active', value: 'Today', icon: Clock, color: 'bg-orange-500' }
  ];

  return (
    <DashboardLayout 
      title="Student Dashboard" 
      subtitle="Welcome back! Here's what's happening with your learning."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
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
          {/* Quick Search */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search for materials, courses..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/search?q=${(e.target as HTMLInputElement).value}`);
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={() => navigate(`/search?q=${searchQuery}`)}
                  className="bg-[#0158fe] hover:bg-[#012060]"
                >
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Materials */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Materials</CardTitle>
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
              ) : recentMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No materials available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMaterials.map((material) => (
                    <div 
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* My Courses */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0158fe]"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div 
                      key={course.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/resources?course=${course.code}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-[#012060]">{course.code}</h4>
                          <p className="text-sm text-gray-500 truncate">{course.title}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/resources')}
              >
                <BookOpen className="mr-2 w-4 h-4" />
                Browse Resources
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/search')}
              >
                <Search className="mr-2 w-4 h-4" />
                Search Materials
              </Button>
            </CardContent>
          </Card>

          {/* Trending */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-[#0158fe] to-[#012060] text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="font-semibold">Popular This Week</h3>
              </div>
              <p className="text-white/80 text-sm mb-4">
                Check out the most downloaded materials this week.
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate('/resources')}
                className="w-full"
              >
                View Trending
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
