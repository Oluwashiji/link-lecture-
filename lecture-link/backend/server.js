/**
 * LECTURE-LINK Backend Server
 * Express API with JSON file-based database
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'lecture-link-secret-key-2024';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// JSON Database Helper
class JSONDatabase {
  constructor(filename) {
    this.filePath = path.join(DATA_DIR, filename);
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`Error loading ${this.filePath}:`, error);
    }
    return [];
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error(`Error saving ${this.filePath}:`, error);
    }
  }

  findAll() {
    return this.data;
  }

  findById(id) {
    return this.data.find(item => item.id === id);
  }

  findOne(query) {
    return this.data.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  create(item) {
    const newItem = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };
    this.data.push(newItem);
    this.save();
    return newItem;
  }

  update(id, updates) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data[index];
    }
    return null;
  }

  delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }
}

// Initialize databases
const usersDB = new JSONDatabase('users.json');
const coursesDB = new JSONDatabase('courses.json');
const materialsDB = new JSONDatabase('materials.json');
const downloadsDB = new JSONDatabase('downloads.json');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(UPLOADS_DIR, 'materials');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'application/pdf' ||
                     file.mimetype === 'application/msword' ||
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                     file.mimetype === 'application/vnd.ms-powerpoint' ||
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                     file.mimetype === 'text/plain' ||
                     file.mimetype === 'application/zip' ||
                     file.mimetype === 'application/x-rar-compressed';
    
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only documents and archives are allowed'));
  }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Initialize default admin user
const initializeDefaultData = async () => {
  const adminExists = usersDB.findOne({ email: 'admin@lcu.edu.ng' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    usersDB.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@lcu.edu.ng',
      password: hashedPassword,
      role: 'admin',
      department: 'Computer Science',
      isActive: true
    });
    console.log('Default admin created: admin@lcu.edu.ng / admin123');
  }

  // Create sample courses if none exist
  if (coursesDB.findAll().length === 0) {
    const sampleCourses = [
      { code: 'CSC 101', title: 'Introduction to Computer Science', description: 'Fundamentals of computing', department: 'Computer Science', level: '100' },
      { code: 'CSC 201', title: 'Data Structures and Algorithms', description: 'Core computer science concepts', department: 'Computer Science', level: '200' },
      { code: 'CSC 301', title: 'Database Management Systems', description: 'Relational databases and SQL', department: 'Computer Science', level: '300' },
      { code: 'CSC 401', title: 'Software Engineering', description: 'Software development methodologies', department: 'Computer Science', level: '400' },
      { code: 'CSC 405', title: 'Artificial Intelligence', description: 'AI and machine learning fundamentals', department: 'Computer Science', level: '400' }
    ];
    sampleCourses.forEach(course => coursesDB.create(course));
    console.log('Sample courses created');
  }
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, matricNumber } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if user exists
    const existingUser = usersDB.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role
    if (!['student', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = usersDB.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department: department || 'Computer Science',
      matricNumber: role === 'student' ? matricNumber : null,
      isActive: true
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = usersDB.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        matricNumber: user.matricNumber
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = usersDB.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    department: user.department,
    matricNumber: user.matricNumber
  });
});

// ==================== USER ROUTES (Admin Only) ====================

// Get all users
app.get('/api/users', authenticateToken, authorize('admin'), (req, res) => {
  const users = usersDB.findAll().map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    department: user.department,
    matricNumber: user.matricNumber,
    isActive: user.isActive,
    createdAt: user.createdAt
  }));
  res.json(users);
});

// Create user (admin only)
app.post('/api/users', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, matricNumber } = req.body;

    const existingUser = usersDB.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = usersDB.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department: department || 'Computer Science',
      matricNumber: role === 'student' ? matricNumber : null,
      isActive: true
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
app.put('/api/users/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = usersDB.update(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
app.delete('/api/users/:id', authenticateToken, authorize('admin'), (req, res) => {
  const user = usersDB.delete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User deleted successfully' });
});

// ==================== COURSE ROUTES ====================

// Get all courses
app.get('/api/courses', authenticateToken, (req, res) => {
  const courses = coursesDB.findAll();
  res.json(courses);
});

// Get course by ID
app.get('/api/courses/:id', authenticateToken, (req, res) => {
  const course = coursesDB.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
});

// Create course (admin/lecturer only)
app.post('/api/courses', authenticateToken, authorize('admin', 'lecturer'), (req, res) => {
  const { code, title, description, department, level } = req.body;
  
  if (!code || !title) {
    return res.status(400).json({ message: 'Course code and title are required' });
  }

  const existingCourse = coursesDB.findOne({ code: code.toUpperCase() });
  if (existingCourse) {
    return res.status(400).json({ message: 'Course code already exists' });
  }

  const course = coursesDB.create({
    code: code.toUpperCase(),
    title,
    description,
    department: department || 'Computer Science',
    level: level || '100'
  });

  res.status(201).json({ message: 'Course created successfully', course });
});

// Update course (admin/lecturer only)
app.put('/api/courses/:id', authenticateToken, authorize('admin', 'lecturer'), (req, res) => {
  const course = coursesDB.update(req.params.id, req.body);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json({ message: 'Course updated successfully', course });
});

// Delete course (admin only)
app.delete('/api/courses/:id', authenticateToken, authorize('admin'), (req, res) => {
  const course = coursesDB.delete(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json({ message: 'Course deleted successfully' });
});

// ==================== MATERIAL ROUTES ====================

// Get all materials (with filters)
app.get('/api/materials', authenticateToken, (req, res) => {
  const { courseCode, search, lecturerId } = req.query;
  let materials = materialsDB.findAll();

  // Filter by course code
  if (courseCode) {
    materials = materials.filter(m => m.courseCode === courseCode.toUpperCase());
  }

  // Filter by lecturer
  if (lecturerId) {
    materials = materials.filter(m => m.uploadedBy === lecturerId);
  }

  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    materials = materials.filter(m => 
      m.title.toLowerCase().includes(searchLower) ||
      m.description?.toLowerCase().includes(searchLower) ||
      m.courseCode.toLowerCase().includes(searchLower)
    );
  }

  // Add download count to each material
  materials = materials.map(m => {
    const downloadCount = downloadsDB.findAll().filter(d => d.materialId === m.id).length;
    return { ...m, downloadCount };
  });

  // Sort by newest first
  materials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(materials);
});

// Get material by ID
app.get('/api/materials/:id', authenticateToken, (req, res) => {
  const material = materialsDB.findById(req.params.id);
  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }

  const downloadCount = downloadsDB.findAll().filter(d => d.materialId === material.id).length;
  const uploader = usersDB.findById(material.uploadedBy);

  res.json({
    ...material,
    downloadCount,
    uploader: uploader ? `${uploader.firstName} ${uploader.lastName}` : 'Unknown'
  });
});

// Upload material (lecturer/admin only)
app.post('/api/materials', authenticateToken, authorize('lecturer', 'admin'), upload.single('file'), (req, res) => {
  try {
    const { title, description, courseCode } = req.body;

    if (!title || !courseCode) {
      return res.status(400).json({ message: 'Title and course code are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const material = materialsDB.create({
      title,
      description,
      courseCode: courseCode.toUpperCase(),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user.id,
      downloadCount: 0
    });

    res.status(201).json({ message: 'Material uploaded successfully', material });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// Download material
app.get('/api/materials/:id/download', authenticateToken, (req, res) => {
  const material = materialsDB.findById(req.params.id);
  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }

  const filePath = path.join(UPLOADS_DIR, 'materials', material.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Record download
  downloadsDB.create({
    materialId: material.id,
    userId: req.user.id,
    downloadedAt: new Date().toISOString()
  });

  res.download(filePath, material.originalName);
});

// Delete material (owner or admin only)
app.delete('/api/materials/:id', authenticateToken, (req, res) => {
  const material = materialsDB.findById(req.params.id);
  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }

  // Check ownership or admin
  if (material.uploadedBy !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this material' });
  }

  // Delete file
  const filePath = path.join(UPLOADS_DIR, 'materials', material.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  materialsDB.delete(req.params.id);
  res.json({ message: 'Material deleted successfully' });
});

// ==================== ANALYTICS ROUTES (Admin Only) ====================

// Get dashboard analytics
app.get('/api/analytics/dashboard', authenticateToken, authorize('admin'), (req, res) => {
  const users = usersDB.findAll();
  const materials = materialsDB.findAll();
  const downloads = downloadsDB.findAll();
  const courses = coursesDB.findAll();

  const stats = {
    totalUsers: users.length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalLecturers: users.filter(u => u.role === 'lecturer').length,
    totalMaterials: materials.length,
    totalDownloads: downloads.length,
    totalCourses: courses.length,
    recentUploads: materials.slice(-5).reverse(),
    popularMaterials: materials
      .map(m => ({
        ...m,
        downloadCount: downloads.filter(d => d.materialId === m.id).length
      }))
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5)
  };

  res.json(stats);
});

// Get lecturer stats
app.get('/api/analytics/lecturer', authenticateToken, authorize('lecturer', 'admin'), (req, res) => {
  const lecturerId = req.user.role === 'admin' ? req.query.lecturerId : req.user.id;
  
  if (!lecturerId) {
    return res.status(400).json({ message: 'Lecturer ID required' });
  }

  const materials = materialsDB.findAll().filter(m => m.uploadedBy === lecturerId);
  const downloads = downloadsDB.findAll();

  const stats = {
    totalUploads: materials.length,
    totalDownloads: materials.reduce((sum, m) => {
      return sum + downloads.filter(d => d.materialId === m.id).length;
    }, 0),
    materials: materials.map(m => ({
      ...m,
      downloadCount: downloads.filter(d => d.materialId === m.id).length
    })).sort((a, b) => b.downloadCount - a.downloadCount)
  };

  res.json(stats);
});

// ==================== SEARCH ROUTE ====================

// Global search
app.get('/api/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ materials: [], courses: [] });
  }

  const searchLower = q.toLowerCase();

  // Search materials
  const materials = materialsDB.findAll().filter(m =>
    m.title.toLowerCase().includes(searchLower) ||
    m.description?.toLowerCase().includes(searchLower) ||
    m.courseCode.toLowerCase().includes(searchLower)
  ).map(m => {
    const downloadCount = downloadsDB.findAll().filter(d => d.materialId === m.id).length;
    return { ...m, downloadCount };
  });

  // Search courses
  const courses = coursesDB.findAll().filter(c =>
    c.code.toLowerCase().includes(searchLower) ||
    c.title.toLowerCase().includes(searchLower) ||
    c.description?.toLowerCase().includes(searchLower)
  );

  res.json({ materials, courses });
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 50MB)' });
    }
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           LECTURE-LINK API Server Running                  ║
║                                                            ║
║   URL: http://localhost:${PORT}                             ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  initializeDefaultData();
});

module.exports = app;
