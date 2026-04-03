import { useEffect, useRef, useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  Search, 
  Shield, 
  Users, 
  Brain,
  Menu,
  X,
  ChevronRight,
  Star,
  Play,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Assistance',
    description: 'Get instant answers and explanations with our integrated AI chatbot, available 24/7 to support your learning journey.'
  },
  {
    icon: BookOpen,
    title: 'Resource Repository',
    description: 'Access a comprehensive collection of lecture materials, notes, and resources organized by course and topic.'
  },
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Lecturers can effortlessly upload and organize materials, making content distribution seamless and efficient.'
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find exactly what you need with our intelligent search system that understands context and relevance.'
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Your data is protected with enterprise-grade security, ensuring only authorized users can access materials.'
  },
  {
    icon: Users,
    title: 'Collaborative Learning',
    description: 'Connect with peers and instructors, fostering a community of knowledge sharing and academic growth.'
  }
];

const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Professor of Computer Science',
    quote: 'LECTURE-LINK has transformed how I distribute course materials. The AI assistance helps students get immediate answers to common questions.',
    image: '/testimonial-1.jpg',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Computer Science Student',
    quote: 'Finding relevant study materials has never been easier. The search functionality is incredibly intuitive and saves me hours every week.',
    image: '/testimonial-2.jpg',
    rating: 5
  },
  {
    name: 'Prof. Amara Okafor',
    role: 'Head of Department',
    quote: 'This platform has streamlined our departmental operations. Students are more engaged, and lecturers can focus on teaching rather than administration.',
    image: '/testimonial-3.jpg',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Final Year Student',
    quote: 'The resource repository is a game-changer. I can access materials from all my courses in one place, and the AI chatbot helps clarify complex topics.',
    image: '/testimonial-4.jpg',
    rating: 5
  }
];

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up as a student or lecturer with your university credentials. Verify your email and complete your profile setup in minutes.',
    image: '/about-tablet.jpg'
  },
  {
    number: '02',
    title: 'Browse & Search Resources',
    description: 'Explore materials by course, topic, or lecturer. Use our smart search to find exactly what you need for your studies.',
    image: '/about-studying.jpg'
  },
  {
    number: '03',
    title: 'Download & Start Learning',
    description: 'Access lecture materials, take notes, and enhance your learning with AI-powered assistance whenever you need help.',
    image: '/about-students.jpg'
  }
];

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (path: string) => {
    (window as any).navigate(path);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-lg shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0158fe] rounded-full flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem', color: '#0158fe', letterSpacing: '0.02em' }}>LECTURE-LINK</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-[#0158fe] transition-colors">Home</a>
              <a href="#about" className="text-gray-700 hover:text-[#0158fe] transition-colors">About</a>
              <a href="#features" className="text-gray-700 hover:text-[#0158fe] transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-[#0158fe] transition-colors">How It Works</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-[#0158fe] hover:text-[#012060]"
              >
                Log In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-[#0158fe] hover:bg-[#012060] text-white"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#home" className="block py-2 text-gray-700">Home</a>
              <a href="#about" className="block py-2 text-gray-700">About</a>
              <a href="#features" className="block py-2 text-gray-700">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-700">How It Works</a>
              <hr />
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="w-full justify-start"
              >
                Log In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="w-full bg-[#0158fe] hover:bg-[#012060] text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9ff] via-white to-[#f0f4ff]">
          <img 
            src="/hero-waves.jpg" 
            alt="" 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 opacity-30"
          />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0158fe]/10 rounded-full">
                <span className="w-2 h-2 bg-[#0158fe] rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-[#0158fe]">AI Enhanced Learning</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#012060] leading-tight">
                AI Enhanced
                <br />
                Departmental
                <br />
                <span className="text-[#0158fe]">Learning Portal</span>
              </h1>

              <p className="text-lg text-gray-600 max-w-lg">
                Connect, Learn, and Grow with AI-Powered Educational Resources. 
                Access lecture materials, collaborate with peers, and enhance your learning experience.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-[#0158fe] hover:bg-[#012060] text-white px-8"
                >
                  Explore Resources
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="border-[#0158fe] text-[#0158fe] hover:bg-[#0158fe] hover:text-white"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-[#012060]">500+</div>
                  <div className="text-sm text-gray-500">Resources</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#012060]">50+</div>
                  <div className="text-sm text-gray-500">Courses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#012060]">1000+</div>
                  <div className="text-sm text-gray-500">Students</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative z-10">
                <img 
                  src="/hero-students.jpg" 
                  alt="Students learning together"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#0158fe]/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#0158fe]/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#f8f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images Grid */}
            <div className="relative hidden lg:block">
              <div className="relative h-[500px]">
                <img 
                  src="/about-students.jpg" 
                  alt="Students collaborating"
                  className="absolute top-0 left-0 w-64 h-48 object-cover rounded-xl shadow-lg transform -rotate-6"
                />
                <img 
                  src="/about-studying.jpg" 
                  alt="Student studying"
                  className="absolute top-20 right-0 w-56 h-72 object-cover rounded-xl shadow-lg transform rotate-3"
                />
                <img 
                  src="/about-tablet.jpg" 
                  alt="Student with tablet"
                  className="absolute bottom-0 left-16 w-60 h-52 object-cover rounded-xl shadow-lg transform -rotate-3"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0158fe]/10 rounded-full">
                <span className="text-sm font-medium text-[#0158fe]">About Us</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-[#012060]">
                Empowering Education Through Technology
              </h2>

              <p className="text-gray-600 leading-relaxed">
                LECTURE-LINK bridges the gap between traditional learning and modern technology. 
                Our platform enables seamless sharing of educational resources, fostering collaboration 
                between students and lecturers in a secure, organized environment.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Designed specifically for the Department of Computer Science at Lead City University, 
                our platform understands the unique needs of academic communities and provides 
                tailored solutions for effective knowledge transfer.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#0158fe]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-[#0158fe]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#012060]">Organized Content</h4>
                    <p className="text-sm text-gray-500">Materials sorted by course</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#0158fe]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#0158fe]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#012060]">Secure Access</h4>
                    <p className="text-sm text-gray-500">University authentication</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/register')}
                className="bg-[#0158fe] hover:bg-[#012060] text-white"
              >
                Learn More About Us
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0158fe]/10 rounded-full mb-4">
              <span className="text-sm font-medium text-[#0158fe]">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#012060] mb-4">
              Everything You Need for Effective Learning
            </h2>
            <p className="text-gray-600">
              Our platform provides a comprehensive suite of tools designed to enhance 
              the educational experience for both students and lecturers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:border-[#0158fe]/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-[#0158fe]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0158fe] transition-colors">
                  <feature.icon className="w-7 h-7 text-[#0158fe] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-[#012060] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#f8f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0158fe]/10 rounded-full mb-4">
              <span className="text-sm font-medium text-[#0158fe]">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#012060] mb-4">
              Get Started in Three Simple Steps
            </h2>
            <p className="text-gray-600">
              Begin your enhanced learning journey with just a few simple steps.
            </p>
          </div>

          <div className="space-y-24">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <div className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative">
                    <span className="absolute -top-8 -left-4 text-8xl font-bold text-[#0158fe]/10">
                      {step.number}
                    </span>
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="relative z-10 rounded-2xl shadow-xl w-full max-w-md"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0158fe] text-white font-bold rounded-xl">
                    {step.number}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#012060]">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0158fe]/10 rounded-full mb-4">
              <span className="text-sm font-medium text-[#0158fe]">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#012060] mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600">
              Hear from students and lecturers who have transformed their learning experience.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-[#f8f9ff] rounded-2xl p-8 md:p-12 text-center">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
                      />
                      <div className="flex justify-center gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-lg md:text-xl text-gray-700 italic mb-6">
                        "{testimonial.quote}"
                      </p>
                      <h4 className="font-semibold text-[#012060]">{testimonial.name}</h4>
                      <p className="text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-[#0158fe]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0158fe]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of students and lecturers already using LECTURE-LINK 
            to enhance education through technology.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white text-[#0158fe] hover:bg-gray-100 px-8"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#012060] text-white py-16" style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}>
        <div className="w-full px-8 sm:px-12 lg:px-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0158fe] rounded-full flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem', color: '#ffffff', letterSpacing: '0.02em' }}>LECTURE-LINK</span>
              </div>
              <p className="text-white/70">
                Empowering education through intelligent technology. Connect, learn, and grow with our AI-enhanced learning platform.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-white/70 hover:text-white transition-colors">Home</a></li>
                <li><a href="#about" className="text-white/70 hover:text-white transition-colors">About</a></li>
                <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><span className="text-white/70 hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="text-white/70 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-white/70 hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="text-white/70 hover:text-white transition-colors cursor-pointer">FAQ</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="mailto:oluwashijibomii@yahoo.com" className="text-white/70 hover:text-white transition-colors">oluwashijibomii@yahoo.com</a></li>
                <li><a href="tel:07081936853" className="text-white/70 hover:text-white transition-colors">+234 (0) 708-193-6853</a></li>
                <li>Lead City University</li>
                <li>Ibadan, Nigeria</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/50">
            <p>&copy; 2026 LECTURE-LINK. All rights reserved. Department of Computer Science, Lead City University.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
