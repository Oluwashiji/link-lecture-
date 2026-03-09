import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  Course, 
  Material, 
  UploadMaterialData,
  DashboardStats,
  LecturerStats,
  SearchResults 
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API requests
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth Services
export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetchApi<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return response;
  },

  register: async (data: RegisterData) => {
    const response = await fetchApi<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response;
  },

  getCurrentUser: async () => {
    return fetchApi<User>('/auth/me');
  }
};

// User Services (Admin only)
export const userService = {
  getAllUsers: async () => {
    return fetchApi<User[]>('/users');
  },

  createUser: async (data: Partial<User> & { password?: string }) => {
    return fetchApi<{ message: string; user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateUser: async (id: string, data: Partial<User> & { password?: string }) => {
    return fetchApi<{ message: string; user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteUser: async (id: string) => {
    return fetchApi<{ message: string }>(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// Course Services
export const courseService = {
  getAllCourses: async () => {
    return fetchApi<Course[]>('/courses');
  },

  getCourseById: async (id: string) => {
    return fetchApi<Course>(`/courses/${id}`);
  },

  createCourse: async (data: Partial<Course>) => {
    return fetchApi<{ message: string; course: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    return fetchApi<{ message: string; course: Course }>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteCourse: async (id: string) => {
    return fetchApi<{ message: string }>(`/courses/${id}`, {
      method: 'DELETE'
    });
  }
};

// Material Services
export const materialService = {
  getAllMaterials: async (filters?: { courseCode?: string; search?: string; lecturerId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.courseCode) params.append('courseCode', filters.courseCode);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.lecturerId) params.append('lecturerId', filters.lecturerId);
    
    return fetchApi<Material[]>(`/materials?${params.toString()}`);
  },

  getMaterialById: async (id: string) => {
    return fetchApi<Material>(`/materials/${id}`);
  },

  uploadMaterial: async (data: UploadMaterialData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('courseCode', data.courseCode);
    formData.append('file', data.file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message);
    }

    return response.json();
  },

  downloadMaterial: async (id: string, filename: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/materials/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  deleteMaterial: async (id: string) => {
    return fetchApi<{ message: string }>(`/materials/${id}`, {
      method: 'DELETE'
    });
  }
};

// Analytics Services
export const analyticsService = {
  getDashboardStats: async () => {
    return fetchApi<DashboardStats>('/analytics/dashboard');
  },

  getLecturerStats: async (lecturerId?: string) => {
    const params = lecturerId ? `?lecturerId=${lecturerId}` : '';
    return fetchApi<LecturerStats>(`/analytics/lecturer${params}`);
  }
};

// Search Services
export const searchService = {
  search: async (query: string) => {
    return fetchApi<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
  }
};
