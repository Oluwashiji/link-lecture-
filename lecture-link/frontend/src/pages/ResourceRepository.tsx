import { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  ChevronDown,
  Trash2,
  X,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Material, Course } from '@/types';
import { materialService, courseService } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function PDFViewerModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const token = localStorage.getItem('token');
  const pdfUrl = `${API_URL}/materials/${material.id}/view`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 bg-[#012060] text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" />
          <span className="font-medium truncate max-w-[300px] sm:max-w-none">{material.title}</span>
          <span className="text-blue-200 text-sm hidden sm:inline">({material.courseCode})</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <iframe
        src={`${pdfUrl}#toolbar=1`}
        className="flex-1 w-full bg-gray-100"
        title={material.title}
        style={{ border: 'none' }}
      />
    </div>
  );
}

export function ResourceRepository() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadData();
  }, [selectedCourse]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (selectedCourse) filters.courseCode = selectedCourse;
      
      const [materialsData, coursesData] = await Promise.all([
        materialService.getAllMaterials(filters),
        courseService.getAllCourses()
      ]);
      setMaterials(materialsData);
      setCourses(coursesData);
    } catch (error: any) {
      toast.error('Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await materialService.getAllMaterials({ 
        search: searchQuery,
        courseCode: selectedCourse 
      });
      setMaterials(data);
    } catch (error: any) {
      toast.error('Search failed');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await materialService.deleteMaterial(id);
      toast.success('Material deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete material');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'DOC';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PPT';
    if (fileType.includes('text')) return 'TXT';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'ZIP';
    return 'FILE';
  };

  const filteredMaterials = materials.filter(m => 
    searchQuery === '' || 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Resource Repository" 
      subtitle="Browse and download lecture materials."
    >
      {/* PDF Viewer Modal */}
      {viewingMaterial && (
        <PDFViewerModal material={viewingMaterial} onClose={() => setViewingMaterial(null)} />
      )}
      {/* Filters */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search materials..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-10 pl-10 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0158fe] focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.code}>{course.code} - {course.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-[#0158fe] hover:bg-[#012060]"
            >
              Search
            </Button>
            {selectedCourse && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedCourse('');
                  setSearchQuery('');
                  loadData();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0158fe]"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No materials found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedCourse 
              ? 'Try adjusting your search or filters' 
              : 'No materials have been uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div className="w-14 h-14 bg-[#0158fe]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#0158fe]">
                      {getFileIcon(material.fileType)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#012060] truncate">{material.title}</h3>
                    <p className="text-sm text-gray-500">{material.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{material.courseCode}</span>
                      <span>{formatFileSize(material.fileSize)}</span>
                      <span>{material.downloadCount} downloads</span>
                      <span>By {material.uploader || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(material.isPdf || material.fileType === 'application/pdf' || material.originalName?.toLowerCase().endsWith('.pdf')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingMaterial(material)}
                        className="border-[#0158fe] text-[#0158fe] hover:bg-[#0158fe]/5"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDownload(material)}
                      className="bg-[#0158fe] hover:bg-[#012060]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    {(hasRole(['admin']) || material.uploadedBy === user?.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
