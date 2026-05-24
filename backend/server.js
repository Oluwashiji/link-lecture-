app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, level, matricNumber, teachingDepartments, teachingCourses } = req.body;
    if (!firstName || !lastName || !email || !password || !role) return res.status(400).json({ message: 'All required fields must be provided' });
    if (usersDB.findOne({ email })) return res.status(400).json({ message: 'User already exists with this email' });
    if (!['student', 'lecturer', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = usersDB.create({
      firstName, lastName, email,
      password: await bcrypt.hash(password, 10),
      role,
      department: department || 'Computer Science',
      level: role === 'student' ? (level || '100') : null,
      matricNumber: role === 'student' ? matricNumber : null,
      teachingDepartments: role === 'lecturer' ? (teachingDepartments || []) : [],
      teachingCourses: role === 'lecturer' ? (teachingCourses || []) : [],
      isActive: true
    });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      message: 'User registered successfully', token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, department: user.department, level: user.level, teachingDepartments: user.teachingDepartments, teachingCourses: user.teachingCourses }
    });
  } catch (e) { res.status(500).json({ message: 'Server error during registration' }); }
});
