
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { Class } from '@/types/user';
import ClassCard from '@/components/ClassCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock data for demonstration
const mockClasses: Class[] = [
  {
    id: '1',
    teacherId: 'teacher1',
    title: 'Introduction to Python Programming',
    topic: 'Programming',
    description: 'A beginner-friendly course to learn Python programming from scratch.',
    maxStudents: 30,
    currentStudents: 15,
    isFree: true,
    teacherImage: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
    teacherQualifications: 'PhD in Computer Science',
    teacherExpertise: 'Python, Web Development, Machine Learning',
    registrationDeadline: new Date('2025-06-30'),
    startDate: new Date('2025-07-15'),
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    teacherId: 'teacher2',
    title: 'Advanced Data Structures',
    topic: 'Computer Science',
    description: 'An in-depth exploration of advanced data structures and their applications.',
    maxStudents: 20,
    currentStudents: 18,
    isFree: false,
    price: 49.99,
    teacherImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    teacherQualifications: 'Masters in Computer Science',
    teacherExpertise: 'Data Structures, Algorithms, C++',
    registrationDeadline: new Date('2025-06-15'),
    startDate: new Date('2025-07-01'),
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    teacherId: 'teacher3',
    title: 'Web Development Bootcamp',
    topic: 'Web Development',
    description: 'Learn to build modern web applications with HTML, CSS, and JavaScript.',
    maxStudents: null,
    currentStudents: 45,
    isFree: false,
    price: 99.99,
    teacherImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    teacherQualifications: 'Senior Web Developer',
    teacherExpertise: 'HTML, CSS, JavaScript, React',
    registrationDeadline: null,
    startDate: new Date('2025-06-01'),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const ClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(user?.role === 'teacher' ? 'my-classes' : 'explore');
  
  const enrolledClasses: string[] = ['1']; // Mock enrolled classes
  const pendingClasses: string[] = ['2']; // Mock pending classes
  
  const filteredClasses = mockClasses.filter(cls => 
    cls.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cls.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRequestJoin = (classId: string) => {
    toast.success("Request to join class sent!");
    // In a real app, you would send an API request here
  };
  
  const handleCreateClass = () => {
    navigate('/classes/create');
  };
  
  const handleViewClass = (classId: string) => {
    navigate(`/classes/${classId}`);
  };
  
  return (
    <div className="container mx-auto p-4 min-h-[90vh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
        {user?.role === 'teacher' && (
          <Button onClick={handleCreateClass}>
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          {user?.role === 'student' && (
            <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
          )}
          {user?.role === 'teacher' ? (
            <TabsTrigger value="my-classes">My Classes</TabsTrigger>
          ) : (
            <TabsTrigger value="pending">Pending</TabsTrigger>
          )}
        </TabsList>
        
        <div className="relative mb-6">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <TabsContent value="explore" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => (
              <ClassCard
                key={cls.id}
                classData={cls}
                isEnrolled={enrolledClasses.includes(cls.id)}
                isPending={pendingClasses.includes(cls.id)}
                onRequestJoin={() => handleRequestJoin(cls.id)}
                onViewDetails={() => handleViewClass(cls.id)}
              />
            ))}
            
            {filteredClasses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No classes found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="enrolled" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses
              .filter(cls => enrolledClasses.includes(cls.id))
              .map(cls => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  isEnrolled={true}
                  onViewDetails={() => handleViewClass(cls.id)}
                />
              ))}
            
            {filteredClasses.filter(cls => enrolledClasses.includes(cls.id)).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">You are not enrolled in any classes yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses
              .filter(cls => pendingClasses.includes(cls.id))
              .map(cls => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  isPending={true}
                  onViewDetails={() => handleViewClass(cls.id)}
                />
              ))}
            
            {filteredClasses.filter(cls => pendingClasses.includes(cls.id)).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">You don't have any pending class requests.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="my-classes" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses
              .filter(cls => cls.teacherId === user?.email)
              .map(cls => (
                <ClassCard
                  key={cls.id}
                  classData={cls}
                  onViewDetails={() => handleViewClass(cls.id)}
                />
              ))}
            
            {filteredClasses.filter(cls => cls.teacherId === user?.email).length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">You haven't created any classes yet.</p>
                <Button onClick={handleCreateClass} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Class
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassesPage;
