import { useEffect, useState } from 'react';
import { 
  Search, 
  Download, 
  BookOpen,
  FileText
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Material, Course } from '@/types';
import { searchService, materialService } from '@/services/api';
import { toast } from 'sonner';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'materials' | 'courses'>('all');

  // Get query from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await searchService.search(searchQuery);
      setMaterials(results.materials);
      setCourses(results.courses);
    } catch (error: any) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(query);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url);
  };

  const handleDownload = async (material: Material) => {
    try {
      await materialService.downloadMaterial(material.id, material.originalName);
      toast.success('Download started!');
    } catch (error: any) {
      toast.error('Download failed');
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

  const showMaterials = activeFilter === 'all' || activeFilter === 'materials';
  const showCourses = activeFilter === 'all' || activeFilter === 'courses';

  const totalResults = materials.length + courses.length;

  return (
    <DashboardLayout 
      title="Search" 
      subtitle="Find materials and courses quickly."
    >
      {/* Search Bar */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for materials, courses, topics..."
                className="pl-12 h-14 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="h-14 px-8 bg-[#0158fe] hover:bg-[#012060]"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'all' 
                    ? 'bg-[#0158fe] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveFilter('materials')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'materials' 
                    ? 'bg-[#0158fe] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Materials ({materials.length})
              </button>
              <button
                onClick={() => setActiveFilter('courses')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'courses' 
                    ? 'bg-[#0158fe] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Courses ({courses.length})
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0158fe]"></div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or browse all resources
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Materials Results */}
              {showMaterials && materials.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#012060] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Materials ({materials.length})
                  </h3>
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <Card key={material.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#0158fe]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[#0158fe]">
                                {getFileIcon(material.fileType)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#012060] truncate">{material.title}</h4>
                              <p className="text-sm text-gray-500">{material.description || 'No description'}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                <span className="bg-gray-100 px-2 py-0.5 rounded">{material.courseCode}</span>
                                <span>{formatFileSize(material.fileSize)}</span>
                                <span>{material.downloadCount} downloads</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(material)}
                              className="bg-[#0158fe] hover:bg-[#012060]"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses Results */}
              {showCourses && courses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#012060] mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Courses ({courses.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {courses.map((course) => (
                      <Card key={course.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => (window as any).navigate(`/resources?course=${course.code}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#012060]">{course.code}</h4>
                              <p className="text-sm text-gray-600">{course.title}</p>
                              <p className="text-sm text-gray-400 mt-1">{course.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{course.level} Level</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{course.department}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="text-center py-16">
          <Search className="w-20 h-20 mx-auto mb-6 text-[#0158fe]/30" />
          <h3 className="text-xl font-semibold text-[#012060] mb-2">Start Searching</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a keyword above to search for lecture materials, courses, and educational resources.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['CSC 101', 'Programming', 'Database', 'Algorithm'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  performSearch(term);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
