// User Types
export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  level?: string;                    // students: '100'|'200'|'300'|'400'|'500'
  teachingDepartments?: string[];    // lecturers: departments they teach
  teachingCourses?: string[];        // lecturers: course codes they teach
  matricNumber?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  level?: string;
  teachingDepartments?: string[];
  teachingCourses?: string[];
  matricNumber?: string;
}

// Course Types
export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  department: string;
  level: string;
  createdAt?: string;
}

// Material Types
export interface Material {
  id: string;
  title: string;
  description?: string;
  courseCode: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploaderName?: string;
  uploader?: string;
  downloadCount: number;
  targetDepartments: string[];  // which departments can see this
  targetLevel: string;          // which level can see this
  tags?: string[];
  isPdf?: boolean;
  createdAt?: string;
}

export interface UploadMaterialData {
  title: string;
  description?: string;
  courseCode: string;
  targetDepartments: string[];
  targetLevel: string;
  tags?: string;
  file: File;
}

// Download Types
export interface Download {
  id: string;
  materialId: string;
  userId: string;
  downloadedAt: string;
}

// Analytics Types
export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalMaterials: number;
  totalDownloads: number;
  totalCourses: number;
  totalChatQueries: number;
  recentUploads: Material[];
  popularMaterials: Material[];
}

export interface LecturerStats {
  totalUploads: number;
  totalDownloads: number;
  materials: Material[];
}

// Search Types
export interface SearchResults {
  materials: Material[];
  courses: Course[];
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  token?: string;
  user?: User;
  data?: T;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
}

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Cybersecurity',
] as const;

export const LEVELS = ['100', '200', '300', '400', '500'] as const;

export type Department = typeof DEPARTMENTS[number];
export type Level = typeof LEVELS[number];
