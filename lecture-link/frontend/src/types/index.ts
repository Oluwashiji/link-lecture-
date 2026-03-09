// User Types
export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
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
  uploader?: string;
  downloadCount: number;
  createdAt?: string;
}

export interface UploadMaterialData {
  title: string;
  description?: string;
  courseCode: string;
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

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
}

// Feature Types
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}
