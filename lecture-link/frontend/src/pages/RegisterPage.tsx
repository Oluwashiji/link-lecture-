import { useState } from 'react';
import { BookOpen, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    department: 'Computer Science',
    matricNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Account created successfully!');
      (window as any).navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = (path: string) => {
    (window as any).navigate(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 bg-white py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-[#0158fe] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#0158fe] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#012060]">LECTURE-LINK</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#012060] mb-2">Create Account</h1>
            <p className="text-gray-600">
              Join LECTURE-LINK and start your enhanced learning journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.role === 'student' ? 'border-[#0158fe] bg-[#0158fe]/5' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-medium">Student</span>
                </label>
                <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.role === 'lecturer' ? 'border-[#0158fe] bg-[#0158fe]/5' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="lecturer"
                    checked={formData.role === 'lecturer'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-medium">Lecturer</span>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@lcu.edu.ng"
                value={formData.email}
                onChange={handleChange}
                className="h-12"
                required
              />
            </div>

            {/* Matric Number (for students) */}
            {formData.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="matricNumber">Matric Number</Label>
                <Input
                  id="matricNumber"
                  name="matricNumber"
                  placeholder="e.g., CSC/2019/001"
                  value={formData.matricNumber}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
            )}

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0158fe] focus:border-transparent"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#0158fe] hover:bg-[#012060] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-[#0158fe] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 bg-[#f8f9ff] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0158fe]/5 to-[#012060]/5"></div>
        <img 
          src="/about-students.jpg" 
          alt="Students"
          className="relative z-10 max-w-lg rounded-2xl shadow-2xl"
        />
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#0158fe]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#0158fe]/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
