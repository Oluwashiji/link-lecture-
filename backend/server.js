/**
 * LECTURE-LINK Backend Server
 * Features: Smart Search, LL Assistant (AI Chatbot), PDF Viewer, RBAC
 * AI: Google Gemini (gemini-1.5-flash) — free tier
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
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'linkLecture2024secretkey';

// Initialise Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MATERIALS_DIR = path.join(UPLOADS_DIR, 'materials');
[DATA_DIR, UPLOADS_DIR, MATERIALS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ==================== JSON DATABASE ====================

class JSONDatabase {
  constructor(filename) {
    this.filePath = path.join(DATA_DIR, filename);
    this.data = this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.filePath)) return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch (e) { console.error('DB load error:', e); }
    return [];
  }
  save() {
    try { fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2)); }
    catch (e) { console.error('DB save error:', e); }
  }
  findAll() { return this.data; }
  findById(id) { return this.data.find(i => i.id === id); }
  findOne(q) { return this.data.find(item => Object.keys(q).every(k => item[k] === q[k])); }
  create(item) {
    const n = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };
    this.data.push(n); this.save(); return n;
  }
  update(id, updates) {
    const i = this.data.findIndex(x => x.id === id);
    if (i !== -1) {
      this.data[i] = { ...this.data[i], ...updates, updatedAt: new Date().toISOString() };
      this.save(); return this.data[i];
    }
    return null;
  }
  delete(id) {
    const i = this.data.findIndex(x => x.id === id);
    if (i !== -1) { const d = this.data.splice(i, 1)[0]; this.save(); return d; }
    return null;
  }
}

const usersDB     = new JSONDatabase('users.json');
const coursesDB   = new JSONDatabase('courses.json');
const materialsDB = new JSONDatabase('materials.json');
const downloadsDB = new JSONDatabase('downloads.json');
const chatLogsDB  = new JSONDatabase('chatlogs.json');

// ==================== MULTER ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MATERIALS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ];
    const allowedExt = /\.(pdf|doc|docx|ppt|pptx|txt|zip|rar)$/i;
    if (allowedExt.test(file.originalname) || allowedMimes.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only documents and archives are allowed'));
  }
});

// ==================== AUTH MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; next();
  });
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
  next();
};

// ==================== SMART SEARCH ====================

function smartSearch(materials, query) {
  if (!query || !query.trim()) return materials;
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);

  return materials
    .map(m => {
      let score = 0;
      const title    = (m.title        || '').toLowerCase();
      const desc     = (m.description  || '').toLowerCase();
      const code     = (m.courseCode   || '').toLowerCase();
      const tags     = (m.tags         || []).join(' ').toLowerCase();
      const uploader = (m.uploaderName || '').toLowerCase();

      if (title.includes(q)) score += 100;
      if (code.includes(q))  score += 80;
      if (tags.includes(q))  score += 60;
      if (desc.includes(q))  score += 40;

      terms.forEach(t => {
        if (title.includes(t))    score += 30;
        if (code.includes(t))     score += 25;
        if (tags.includes(t))     score += 20;
        if (desc.includes(t))     score += 10;
        if (uploader.includes(t)) score += 5;
      });

      const daysOld = (Date.now() - new Date(m.createdAt).getTime()) / 86400000;
      if (daysOld < 7) score += 10; else if (daysOld < 30) score += 5;

      return { ...m, _score: score };
    })
    .filter(m => m._score > 0)
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...m }) => m);
}

function smartCourseSearch(courses, query) {
  if (!query || !query.trim()) return courses;
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);

  return courses
    .map(c => {
      let score = 0;
      const code  = (c.code        || '').toLowerCase();
      const title = (c.title       || '').toLowerCase();
      const desc  = (c.description || '').toLowerCase();
      if (code.includes(q))  score += 80;
      if (title.includes(q)) score += 60;
      if (desc.includes(q))  score += 20;
      terms.forEach(t => {
        if (code.includes(t))  score += 25;
        if (title.includes(t)) score += 20;
        if (desc.includes(t))  score += 8;
      });
      return { ...c, _score: score };
    })
    .filter(c => c._score > 0)
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...c }) => c);
}

// ==================== INIT DATA ====================

const initializeDefaultData = async () => {
  if (!usersDB.findOne({ email: 'admin@lcu.edu.ng' })) {
    usersDB.create({
      firstName: 'System', lastName: 'Administrator',
      email: 'admin@lcu.edu.ng',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin', department: 'Computer Science',
      level: null, teachingDepartments: [], teachingCourses: [],
      isActive: true
    });
    console.log('Default admin created: admin@lcu.edu.ng / admin123');
  }

  if (coursesDB.findAll().length === 0) {
    [
      // Computer Science
      { code: 'CSC 101', title: 'Introduction to Computer Science',  description: 'Fundamentals of computing',           department: 'Computer Science',      level: '100' },
      { code: 'CSC 102', title: 'Introduction to Problem Solving',   description: 'Algorithms and problem solving',      department: 'Computer Science',      level: '100' },
      { code: 'CSC 201', title: 'Data Structures and Algorithms',    description: 'Core data structures',                department: 'Computer Science',      level: '200' },
      { code: 'CSC 203', title: 'Computer Organisation',             description: 'Hardware and architecture basics',    department: 'Computer Science',      level: '200' },
      { code: 'CSC 301', title: 'Database Management Systems',       description: 'Relational databases and SQL',        department: 'Computer Science',      level: '300' },
      { code: 'CSC 305', title: 'Operating Systems',                 description: 'OS concepts and design',              department: 'Computer Science',      level: '300' },
      { code: 'CSC 401', title: 'Software Engineering',              description: 'Software development methodologies',  department: 'Computer Science',      level: '400' },
      { code: 'CSC 405', title: 'Artificial Intelligence',           description: 'AI and machine learning fundamentals',department: 'Computer Science',      level: '400' },
      // Information Technology
      { code: 'IFT 101', title: 'Introduction to Information Technology', description: 'IT fundamentals',               department: 'Information Technology', level: '100' },
      { code: 'IFT 201', title: 'Web Technologies',                  description: 'HTML, CSS, JavaScript basics',        department: 'Information Technology', level: '200' },
      { code: 'IFT 301', title: 'Network Administration',            description: 'Networking concepts and admin',       department: 'Information Technology', level: '300' },
      { code: 'IFT 401', title: 'IT Project Management',             description: 'Managing IT projects',               department: 'Information Technology', level: '400' },
      // Software Engineering
      { code: 'SEN 101', title: 'Introduction to Software Engineering', description: 'SE principles',                   department: 'Software Engineering',   level: '100' },
      { code: 'SEN 201', title: 'Software Design Patterns',          description: 'Design patterns and architecture',    department: 'Software Engineering',   level: '200' },
      { code: 'SEN 301', title: 'Software Testing',                  description: 'Testing methodologies',              department: 'Software Engineering',   level: '300' },
      { code: 'SEN 401', title: 'Agile Development',                 description: 'Agile and Scrum practices',           department: 'Software Engineering',   level: '400' },
      // Cybersecurity
      { code: 'CYB 101', title: 'Introduction to Cybersecurity',     description: 'Security fundamentals',              department: 'Cybersecurity',          level: '100' },
      { code: 'CYB 201', title: 'Ethical Hacking',                   description: 'Penetration testing basics',          department: 'Cybersecurity',          level: '200' },
      { code: 'CYB 301', title: 'Network Security',                  description: 'Securing networks and systems',       department: 'Cybersecurity',          level: '300' },
      { code: 'CYB 401', title: 'Digital Forensics',                 description: 'Forensic investigation techniques',   department: 'Cybersecurity',          level: '400' },
    ].forEach(c => coursesDB.create(c));
    console.log('Sample courses created for all departments and levels');
  }
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, role,
      department, level, matricNumber,
      teachingDepartments, teachingCourses
    } = req.body;

    if (!firstName || !lastName || !email || !password || !role)
      return res.status(400).json({ message: 'All required fields must be provided' });
    if (usersDB.findOne({ email }))
      return res.status(400).json({ message: 'User already exists with this email' });
    if (!['student', 'lecturer', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const user = usersDB.create({
      firstName, lastName, email,
      password: await bcrypt.hash(password, 10),
      role,
      department: department || 'Computer Science',
      level:               role === 'student'  ? (level || '100')          : null,
      matricNumber:        role === 'student'  ? matricNumber               : null,
      teachingDepartments: role === 'lecturer' ? (teachingDepartments || []) : [],
      teachingCourses:     role === 'lecturer' ? (teachingCourses || [])     : [],
      isActive: true
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      message: 'User registered successfully', token,
      user: {
        id: user.id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, department: user.department,
        level: user.level,
        teachingDepartments: user.teachingDepartments,
        teachingCourses: user.teachingCourses
      }
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = usersDB.findOne({ email });
    if (!user || !user.isActive || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful', token,
      user: {
        id: user.id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, department: user.department,
        matricNumber: user.matricNumber,
        level: user.level || null,
        teachingDepartments: user.teachingDepartments || [],
        teachingCourses: user.teachingCourses || []
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = usersDB.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    id: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, role: user.role, department: user.department,
    matricNumber: user.matricNumber,
    level: user.level || null,
    teachingDepartments: user.teachingDepartments || [],
    teachingCourses: user.teachingCourses || []
  });
});

// ==================== USER ROUTES ====================

app.get('/api/users', authenticateToken, authorize('admin'), (req, res) => {
  res.json(usersDB.findAll().map(u => ({
    id: u.id, firstName: u.firstName, lastName: u.lastName,
    email: u.email, role: u.role, department: u.department,
    matricNumber: u.matricNumber, level: u.level,
    teachingDepartments: u.teachingDepartments || [],
    teachingCourses: u.teachingCourses || [],
    isActive: u.isActive, createdAt: u.createdAt
  })));
});

app.post('/api/users', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, matricNumber, level, teachingDepartments, teachingCourses } = req.body;
    if (usersDB.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = usersDB.create({
      firstName, lastName, email,
      password: await bcrypt.hash(password, 10),
      role, department: department || 'Computer Science',
      level: role === 'student' ? (level || '100') : null,
      matricNumber: role === 'student' ? matricNumber : null,
      teachingDepartments: role === 'lecturer' ? (teachingDepartments || []) : [],
      teachingCourses: role === 'lecturer' ? (teachingCourses || []) : [],
      isActive: true
    });
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
    });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

app.put('/api/users/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    const user = usersDB.update(req.params.id, updates);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/users/:id', authenticateToken, authorize('admin'), (req, res) => {
  const user = usersDB.delete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted successfully' });
});

// ==================== COURSE ROUTES ====================

app.get('/api/courses', authenticateToken, (req, res) => {
  const { department, level } = req.query;
  let courses = coursesDB.findAll();

  if (req.user.role === 'student') {
    // Students only see courses for their own department and level
    const studentUser = usersDB.findById(req.user.id);
    if (studentUser) {
      courses = courses.filter(c =>
        c.department === studentUser.department &&
        c.level === studentUser.level
      );
    }
  } else {
    // Lecturers and admins can filter optionally
    if (department) courses = courses.filter(c => c.department === department);
    if (level)      courses = courses.filter(c => c.level === level);
  }

  res.json(courses);
});

app.get('/api/courses/:id', authenticateToken, (req, res) => {
  const c = coursesDB.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Course not found' });
  res.json(c);
});

app.post('/api/courses', authenticateToken, authorize('admin', 'lecturer'), (req, res) => {
  const { code, title, description, department, level } = req.body;
  if (!code || !title) return res.status(400).json({ message: 'Course code and title are required' });
  if (coursesDB.findOne({ code: code.toUpperCase() }))
    return res.status(400).json({ message: 'Course code already exists' });
  const course = coursesDB.create({
    code: code.toUpperCase(), title, description,
    department: department || 'Computer Science',
    level: level || '100'
  });
  res.status(201).json({ message: 'Course created successfully', course });
});

app.put('/api/courses/:id', authenticateToken, authorize('admin', 'lecturer'), (req, res) => {
  const c = coursesDB.update(req.params.id, req.body);
  if (!c) return res.status(404).json({ message: 'Course not found' });
  res.json({ message: 'Course updated successfully', course: c });
});

app.delete('/api/courses/:id', authenticateToken, authorize('admin'), (req, res) => {
  const c = coursesDB.delete(req.params.id);
  if (!c) return res.status(404).json({ message: 'Course not found' });
  res.json({ message: 'Course deleted successfully' });
});

// ==================== MATERIAL ROUTES ====================

app.get('/api/materials', authenticateToken, (req, res) => {
  const { courseCode, search, lecturerId, department, level } = req.query;
  let materials = materialsDB.findAll();
  const downloads = downloadsDB.findAll();

  if (req.user.role === 'student') {
    // Students only see materials targeted at their department and level
    const studentUser = usersDB.findById(req.user.id);
    if (studentUser) {
      materials = materials.filter(m =>
        Array.isArray(m.targetDepartments) &&
        m.targetDepartments.includes(studentUser.department) &&
        m.targetLevel === studentUser.level
      );
    }
  } else {
    // Lecturers/admins can filter manually
    if (department) materials = materials.filter(m =>
      Array.isArray(m.targetDepartments) && m.targetDepartments.includes(department)
    );
    if (level) materials = materials.filter(m => m.targetLevel === level);
  }

  if (courseCode) materials = materials.filter(m => m.courseCode === courseCode.toUpperCase());
  if (lecturerId) materials = materials.filter(m => m.uploadedBy === lecturerId);

  if (search) {
    materials = smartSearch(materials, search);
  } else {
    materials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(materials.map(m => ({
    ...m,
    downloadCount: downloads.filter(d => d.materialId === m.id).length,
    isPdf: m.fileType === 'application/pdf' || m.originalName?.toLowerCase().endsWith('.pdf')
  })));
});

app.get('/api/materials/:id', authenticateToken, (req, res) => {
  const m = materialsDB.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Material not found' });
  const uploader = usersDB.findById(m.uploadedBy);
  res.json({
    ...m,
    downloadCount: downloadsDB.findAll().filter(d => d.materialId === m.id).length,
    uploader: uploader ? `${uploader.firstName} ${uploader.lastName}` : 'Unknown',
    isPdf: m.fileType === 'application/pdf' || m.originalName?.toLowerCase().endsWith('.pdf')
  });
});

app.post('/api/materials', authenticateToken, authorize('lecturer', 'admin'), upload.single('file'), (req, res) => {
  try {
    const { title, description, courseCode, tags, targetDepartments, targetLevel } = req.body;
    if (!title || !courseCode) return res.status(400).json({ message: 'Title and course code are required' });
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    // Parse targetDepartments — sent as JSON string from FormData
    let parsedDepartments = [];
    try { parsedDepartments = JSON.parse(targetDepartments || '[]'); } catch { parsedDepartments = []; }

    const uploader = usersDB.findById(req.user.id);
    const material = materialsDB.create({
      title, description,
      courseCode: courseCode.toUpperCase(),
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: req.user.id,
      uploaderName: uploader ? `${uploader.firstName} ${uploader.lastName}` : 'Unknown',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      targetDepartments: parsedDepartments,
      targetLevel: targetLevel || '100',
      downloadCount: 0
    });
    res.status(201).json({ message: 'Material uploaded successfully', material });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// View PDF in browser
app.get('/api/materials/:id/view', authenticateToken, (req, res) => {
  const m = materialsDB.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Material not found' });
  const filePath = path.join(MATERIALS_DIR, m.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
  const isPdf = m.fileType === 'application/pdf' || m.originalName?.toLowerCase().endsWith('.pdf');
  if (!isPdf) return res.status(400).json({ message: 'Only PDF files can be viewed in browser' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${m.originalName}"`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  fs.createReadStream(filePath).pipe(res);
});

app.get('/api/materials/:id/download', authenticateToken, (req, res) => {
  const m = materialsDB.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Material not found' });
  const filePath = path.join(MATERIALS_DIR, m.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
  downloadsDB.create({ materialId: m.id, userId: req.user.id, downloadedAt: new Date().toISOString() });
  res.download(filePath, m.originalName);
});

app.delete('/api/materials/:id', authenticateToken, (req, res) => {
  const m = materialsDB.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Material not found' });
  if (m.uploadedBy !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });
  const filePath = path.join(MATERIALS_DIR, m.fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  materialsDB.delete(req.params.id);
  res.json({ message: 'Material deleted successfully' });
});

// ==================== SMART SEARCH ====================

app.get('/api/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ materials: [], courses: [] });

  const downloads = downloadsDB.findAll();
  let allMaterials = materialsDB.findAll();
  let allCourses   = coursesDB.findAll();

  // Students only search within their own department and level
  if (req.user.role === 'student') {
    const studentUser = usersDB.findById(req.user.id);
    if (studentUser) {
      allMaterials = allMaterials.filter(m =>
        Array.isArray(m.targetDepartments) &&
        m.targetDepartments.includes(studentUser.department) &&
        m.targetLevel === studentUser.level
      );
      allCourses = allCourses.filter(c =>
        c.department === studentUser.department &&
        c.level === studentUser.level
      );
    }
  }

  const materials = smartSearch(allMaterials, q).map(m => ({
    ...m,
    downloadCount: downloads.filter(d => d.materialId === m.id).length,
    isPdf: m.fileType === 'application/pdf' || m.originalName?.toLowerCase().endsWith('.pdf')
  }));
  const courses = smartCourseSearch(allCourses, q);

  res.json({ materials, courses });
});

// ==================== LL ASSISTANT (GEMINI) ====================

app.post('/api/chat', authenticateToken, chatLimiter, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'LL Assistant is not configured. Please add the GEMINI_API_KEY environment variable.'
      });
    }

    // Build context from repository — personalised to the user's dept/level if student
    const currentUser = usersDB.findById(req.user.id);
    let allMaterials = materialsDB.findAll();
    let allCourses   = coursesDB.findAll();

    if (currentUser?.role === 'student') {
      allMaterials = allMaterials.filter(m =>
        Array.isArray(m.targetDepartments) &&
        m.targetDepartments.includes(currentUser.department) &&
        m.targetLevel === currentUser.level
      );
      allCourses = allCourses.filter(c =>
        c.department === currentUser.department &&
        c.level === currentUser.level
      );
    }

    const relevantMaterials = smartSearch(allMaterials, message).slice(0, 5);
    const repoContext = relevantMaterials.length > 0
      ? `Relevant materials in the repository:\n${relevantMaterials.map(m =>
          `- "${m.title}" (${m.courseCode})${m.description ? ' — ' + m.description : ''}${m.tags?.length ? ' [Tags: ' + m.tags.join(', ') + ']' : ''}`
        ).join('\n')}`
      : `Available courses: ${allCourses.map(c => `${c.code}: ${c.title}`).join(', ')}`;

    const userContext = currentUser
      ? `The user is a ${currentUser.role} in the ${currentUser.department} department${currentUser.level ? ', ' + currentUser.level + ' Level' : ''}.`
      : '';

    const systemPrompt = `You are LL Assistant, the intelligent academic support assistant for the Lecture-Link platform at Lead City University. You are helpful, concise, and academically focused.

${userContext}

Your responsibilities:
- Help students find lecture materials and resources in the repository
- Answer Computer Science and IT academic questions clearly
- Guide users on how to use Lecture-Link
- Provide study tips and academic guidance

${repoContext}

When students ask about materials, reference what's available above. Keep responses clear and concise. Never mention Gemini or Google — you are LL Assistant, built into Lecture-Link.`;

    // Build history — Gemini requires it to start with 'user' role
    const rawHistory = conversationHistory
      .slice(-6)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // Drop any leading model messages
    while (rawHistory.length > 0 && rawHistory[0].role === 'model') {
      rawHistory.shift();
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history: rawHistory });
    const result = await chat.sendMessage(message);
    const reply  = result.response.text();

    chatLogsDB.create({
      userId: req.user.id, userRole: req.user.role,
      message, reply, timestamp: new Date().toISOString()
    });

    res.json({ reply, role: 'assistant' });

  } catch (e) {
    console.error('Chat error full:', e?.message, e?.status, e?.statusText);
    const msg    = e?.message || '';
    const status = e?.status || e?.response?.status || 0;

    if (status === 400 || msg.includes('API_KEY') || msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('invalid')) {
      return res.status(503).json({ message: 'LL Assistant configuration error. Check your GEMINI_API_KEY.' });
    }
    if (status === 403) {
      return res.status(503).json({ message: 'LL Assistant configuration error. The API key is invalid or lacks permissions.' });
    }
    if (status === 429) {
      return res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' });
    }
    res.status(500).json({ message: `LL Assistant error: ${msg || 'Unknown error. Check Render logs.'}` });
  }
});

// ==================== ANALYTICS ====================

app.get('/api/analytics/dashboard', authenticateToken, authorize('admin'), (req, res) => {
  const users     = usersDB.findAll();
  const materials = materialsDB.findAll();
  const downloads = downloadsDB.findAll();
  const courses   = coursesDB.findAll();
  const chats     = chatLogsDB.findAll();
  res.json({
    totalUsers:       users.length,
    totalStudents:    users.filter(u => u.role === 'student').length,
    totalLecturers:   users.filter(u => u.role === 'lecturer').length,
    totalMaterials:   materials.length,
    totalDownloads:   downloads.length,
    totalCourses:     courses.length,
    totalChatQueries: chats.length,
    recentUploads:    materials.slice(-5).reverse(),
    popularMaterials: materials
      .map(m => ({ ...m, downloadCount: downloads.filter(d => d.materialId === m.id).length }))
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5)
  });
});

app.get('/api/analytics/lecturer', authenticateToken, authorize('lecturer', 'admin'), (req, res) => {
  const lecturerId = req.user.role === 'admin' ? req.query.lecturerId : req.user.id;
  if (!lecturerId) return res.status(400).json({ message: 'Lecturer ID required' });
  const materials = materialsDB.findAll().filter(m => m.uploadedBy === lecturerId);
  const downloads = downloadsDB.findAll();
  res.json({
    totalUploads:   materials.length,
    totalDownloads: materials.reduce((s, m) => s + downloads.filter(d => d.materialId === m.id).length, 0),
    materials: materials
      .map(m => ({ ...m, downloadCount: downloads.filter(d => d.materialId === m.id).length }))
      .sort((a, b) => b.downloadCount - a.downloadCount)
  });
});

// ==================== HEALTH ====================

app.get('/api/health', (req, res) => res.json({
  status:      'OK',
  timestamp:   new Date().toISOString(),
  llAssistant: !!process.env.GEMINI_API_KEY
}));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large (max 50MB)' });
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║   LECTURE-LINK API Running on ${PORT}    ║`);
  console.log(`║   LL Assistant: ${process.env.GEMINI_API_KEY ? '✓ Gemini Ready  ' : '✗ No API Key    '}       ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  initializeDefaultData();
});

module.exports = app;
