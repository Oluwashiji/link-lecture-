import { useState } from 'react';
import { BookOpen, Eye, EyeOff, Loader2, ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { UserRole } from '@/types';
import { DEPARTMENTS, LEVELS } from '@/types';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    department: 'Computer Science',
    level: '100',
    matricNumber: '',
    teachingDepartments: [] as string[],
    teachingCourses: [] as string[],
  });
  const [courseInput, setCourseInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleTeachingDept = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      teachingDepartments: prev.teachingDepartments.includes(dept)
        ? prev.teachingDepartments.filter(d => d !== dept)
        : [...prev.teachingDepartments, dept]
    }));
  };

  const addCourse = () => {
    const code = courseInput.trim().toUpperCase();
    if (!code) return;
    if (formData.teachingCourses.includes(code)) {
      toast.error('Course already added');
      return;
    }
    setFormData(prev => ({ ...prev, teachingCourses: [...prev.teachingCourses, code] }));
    setCourseInput('');
  };

  const removeCourse = (code: string) => {
    setFormData(prev => ({
      ...prev,
      teachingCourses: prev.teachingCourses.filter(c => c !== code)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'student' && !formData.matricNumber) {
      toast.error('Please enter your matric number');
      return;
    }
    if (formData.role === 'lecturer') {
      if (formData.teachingDepartments.length === 0) {
        toast.error('Please select at least one department you teach');
        return;
      }
      if (formData.teachingCourses.length === 0) {
        toast.error('Please add at least one course you teach (e.g. CSC 203)');
        return;
      }
    }

    setIsLoading(true);
    try {
      const { confirmPassword, courseInput: _ci, ...rest } = { ...formData, courseInput };
      const registerData = {
        ...rest,
        level: formData.role === 'student' ? formData.level : undefined,
        teachingDepartments: formData.role === 'lecturer' ? formData.teachingDepartments : undefined,
        teachingCourses: formData.role === 'lecturer' ? formData.teachingCourses : undefined,
      };
      await register(registerData);
      toast.success('Account created successfully!');
      (window as any).navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-white py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <button
            onClick={() => (window as any).navigate('/')}
            className="flex items-center text-gray-500 hover:text-[#0158fe] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#0158fe] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#012060]">LECTURE-LINK</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#012060] mb-2">Create Account</h1>
            <p className="text-gray-600">Join LECTURE-LINK and start your enhanced learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-4">
                {(['student', 'lecturer'] as UserRole[]).map(r => (
                  <label key={r} className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.role === r ? 'border-[#0158fe] bg-[#0158fe]/5' : 'border-gray-200'
                  }`}>
                    <input type="radio" name="role" value={r} checked={formData.role === r}
                      onChange={handleChange} className="sr-only" />
                    <span className="font-medium capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" placeholder="John"
                  value={formData.firstName} onChange={handleChange} className="h-12" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe"
                  value={formData.lastName} onChange={handleChange} className="h-12" required />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="john.doe@lcu.edu.ng"
                value={formData.email} onChange={handleChange} className="h-12" required />
            </div>

            {/* Student fields */}
            {formData.role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="matricNumber">Matric Number</Label>
                  <Input id="matricNumber" name="matricNumber" placeholder="e.g. CSC/2022/001"
                    value={formData.matricNumber} onChange={handleChange} className="h-12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select id="department" name="department" value={formData.department}
                    onChange={handleChange}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0158fe]">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select id="level" name="level" value={formData.level} onChange={handleChange}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0158fe]">
                    {LEVELS.map(l => <option key={l} value={l}>{l} Level</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Lecturer fields */}
            {formData.role === 'lecturer' && (
              <>
                <div className="space-y-2">
                  <Label>Departments You Teach <span className="text-gray-400 text-sm">(select all that apply)</span></Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map(dept => (
                      <label key={dept} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm transition-colors ${
                        formData.teachingDepartments.includes(dept)
                          ? 'border-[#0158fe] bg-[#0158fe]/5 text-[#0158fe]'
                          : 'border-gray-200 text-gray-700'
                      }`}>
                        <input type="checkbox" checked={formData.teachingDepartments.includes(dept)}
                          onChange={() => toggleTeachingDept(dept)} className="sr-only" />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          formData.teachingDepartments.includes(dept) ? 'bg-[#0158fe] border-[#0158fe]' : 'border-gray-300'
                        }`}>
                          {formData.teachingDepartments.includes(dept) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                            </svg>
                          )}
                        </div>
                        <span>{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Courses You Teach <span className="text-gray-400 text-sm">(e.g. CSC 203, IFT 301)</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. CSC 203"
                      value={courseInput}
                      onChange={e => setCourseInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCourse(); }}}
                      className="h-10 uppercase"
                    />
                    <Button type="button" onClick={addCourse} className="bg-[#0158fe] hover:bg-[#012060] px-3">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.teachingCourses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.teachingCourses.map(code => (
                        <span key={code} className="flex items-center gap-1 px-3 py-1 bg-[#0158fe]/10 text-[#0158fe] rounded-full text-sm font-medium">
                          {code}
                          <button type="button" onClick={() => removeCourse(code)} className="hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password" value={formData.password}
                  onChange={handleChange} className="h-12 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password"
                placeholder="Confirm your password" value={formData.confirmPassword}
                onChange={handleChange} className="h-12" required />
            </div>

            <Button type="submit" className="w-full h-12 bg-[#0158fe] hover:bg-[#012060] text-white" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Creating account...</> : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button onClick={() => (window as any).navigate('/login')} className="text-[#0158fe] hover:underline font-medium">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-[#f8f9ff] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0158fe]/5 to-[#012060]/5" />
        <img src="/about-students.jpg" alt="Students" className="relative z-10 max-w-lg rounded-2xl shadow-2xl" />
      </div>
    </div>
  );
}
