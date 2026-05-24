import { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { materialService, courseService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Course } from '@/types';
import { DEPARTMENTS, LEVELS } from '@/types';

export function UploadPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [targetLevel, setTargetLevel] = useState('100');
  const [targetDepartments, setTargetDepartments] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lecturer's teaching departments and courses from their profile
  const lecturerDepts = user?.teachingDepartments || [];
  const lecturerCourses = user?.teachingCourses || [];

  useEffect(() => {
    loadCourses();
    // Pre-select all lecturer's departments
    if (lecturerDepts.length > 0) setTargetDepartments(lecturerDepts);
  }, []);

  const loadCourses = async () => {
    try {
      // For lecturers: only show courses they teach
      const data = await courseService.getAllCourses();
      if (user?.role === 'lecturer' && lecturerCourses.length > 0) {
        setCourses(data.filter(c => lecturerCourses.some(lc =>
          c.code.replace(/\s/g, '').toUpperCase() === lc.replace(/\s/g, '').toUpperCase()
        )));
      } else {
        setCourses(data);
      }
    } catch {
      toast.error('Failed to load courses');
    }
  };

  const toggleDept = (dept: string) => {
    setTargetDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (f: File) => {
    if (!f.name.match(/\.(pdf|doc|docx|ppt|pptx|txt|zip|rar)$/i)) {
      toast.error('Invalid file type. Please upload PDF, DOC, PPT, TXT, or ZIP files.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    if (!title.trim()) { toast.error('Please enter a title'); return; }
    if (!courseCode) { toast.error('Please select a course'); return; }
    if (targetDepartments.length === 0) { toast.error('Please select at least one target department'); return; }

    setIsUploading(true);
    try {
      await materialService.uploadMaterial({
        title: title.trim(),
        description: description.trim(),
        courseCode,
        targetDepartments,
        targetLevel,
        file
      });

      toast.success('Material uploaded and synced to the right students!');
      setFile(null); setTitle(''); setDescription(''); setCourseCode('');
      setTargetLevel('100');
      setTargetDepartments(lecturerDepts.length > 0 ? lecturerDepts : []);

      setTimeout(() => (window as any).navigate('/resources'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Departments to show: lecturers see their own depts, admins see all
  const availableDepts = user?.role === 'lecturer' && lecturerDepts.length > 0
    ? lecturerDepts
    : [...DEPARTMENTS];

  return (
    <DashboardLayout title="Upload Material" subtitle="Share lecture materials with the right students.">
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Upload New Material</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* File Drop Zone */}
              <div
                onDragEnter={handleDrag} onDragLeave={handleDrag}
                onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-[#0158fe] bg-[#0158fe]/5'
                  : file ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-[#0158fe] hover:bg-gray-50'
                }`}
              >
                <input ref={fileInputRef} type="file" onChange={handleFileChange}
                  className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar" />
                {file ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="p-2 hover:bg-gray-200 rounded-lg">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-[#0158fe]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-[#0158fe]" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">Drag and drop your file here</p>
                    <p className="text-gray-500 mb-4">or click to browse</p>
                    <p className="text-sm text-gray-400">PDF, DOC, PPT, TXT, ZIP — Max 50MB</p>
                  </>
                )}
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Enter material title" className="mt-1" />
              </div>

              {/* Course */}
              <div>
                <Label htmlFor="course">Course *</Label>
                <select id="course" value={courseCode} onChange={e => setCourseCode(e.target.value)}
                  className="w-full mt-1 h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0158fe]">
                  <option value="">Select a course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.code}>{c.code} — {c.title}</option>
                  ))}
                </select>
                {user?.role === 'lecturer' && courses.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No matching courses found. Ensure your teaching courses are listed in the system.
                  </p>
                )}
              </div>

              {/* Target Level */}
              <div>
                <Label htmlFor="targetLevel">Target Level *</Label>
                <p className="text-sm text-gray-500 mb-2">Which year/level of students is this material for?</p>
                <div className="grid grid-cols-5 gap-2">
                  {LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => setTargetLevel(l)}
                      className={`py-2 rounded-lg border-2 font-medium text-sm transition-colors ${
                        targetLevel === l
                          ? 'border-[#0158fe] bg-[#0158fe] text-white'
                          : 'border-gray-200 text-gray-700 hover:border-[#0158fe]'
                      }`}>
                      {l}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Departments */}
              <div>
                <Label>Target Departments *</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Which departments should see this material?
                  {user?.role === 'lecturer' && lecturerDepts.length > 0 && (
                    <span className="text-[#0158fe]"> (Pre-filled from your profile)</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableDepts.map(dept => (
                    <label key={dept} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-sm transition-colors ${
                      targetDepartments.includes(dept)
                        ? 'border-[#0158fe] bg-[#0158fe]/5 text-[#0158fe]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}>
                      <input type="checkbox" checked={targetDepartments.includes(dept)}
                        onChange={() => toggleDept(dept)} className="sr-only" />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        targetDepartments.includes(dept) ? 'bg-[#0158fe] border-[#0158fe]' : 'border-gray-300'
                      }`}>
                        {targetDepartments.includes(dept) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </div>
                      <span>{dept}</span>
                    </label>
                  ))}
                </div>
                {targetDepartments.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ This material will be visible to {targetLevel} Level students in: {targetDepartments.join(', ')}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Add a brief description (optional)" rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0158fe] resize-none" />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => (window as any).navigate('/resources')} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading || !file} className="flex-1 bg-[#0158fe] hover:bg-[#012060]">
                  {isUploading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />Upload Material</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#0158fe]" />
              Upload Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              {[
                'Select the correct level and departments so only the right students see this material',
                'Upload only educational materials related to your courses',
                'Maximum file size is 50MB per upload',
                'Use clear and descriptive titles for easy searching',
                'Supported formats: PDF, DOC, PPT, TXT, ZIP'
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
