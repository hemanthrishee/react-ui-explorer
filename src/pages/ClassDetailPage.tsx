import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Calendar, Clock, User, Users, Book, CheckCircle, XCircle, MessageSquare, Code } from 'lucide-react';
import { toast } from 'sonner';
import { Class, UserRole, ClassEnrollment } from '@/types/user';
import { CustomBadge } from '@/components/ui/custom-badge';

// Mock data
const mockClass: Class = {
  id: '1',
  teacherId: 'teacher1',
  title: 'Introduction to Python Programming',
  topic: 'Programming',
  description: 'A beginner-friendly course designed to teach Python programming from scratch. Learn variables, data structures, control flow, functions, and object-oriented programming concepts. Build practical projects including a simple game, data analysis tool, and web scraper. No prior programming experience required.',
  maxStudents: 30,
  currentStudents: 15,
  isFree: true,
  teacherImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  teacherQualifications: 'PhD in Computer Science from Stanford University. 10+ years of industry experience at Google and Microsoft.',
  teacherExpertise: 'Python, Machine Learning, Data Science, Web Development, Cloud Computing',
  registrationDeadline: new Date('2025-06-30'),
  startDate: new Date('2025-07-15'),
  status: 'upcoming',
  createdAt: new Date('2025-05-01'),
  updatedAt: new Date('2025-05-01'),
};

const mockTeacher = {
  name: "Dr. Jane Smith",
  email: "teacher1",
};

const mockEnrollments: ClassEnrollment[] = [
  {
    id: 'enroll1',
    classId: '1',
    studentId: 'student1',
    status: 'approved',
    requestDate: new Date('2025-05-05'),
    responseDate: new Date('2025-05-06'),
  },
  {
    id: 'enroll2',
    classId: '1',
    studentId: 'student2',
    status: 'pending',
    requestDate: new Date('2025-05-10'),
  },
  {
    id: 'enroll3',
    classId: '1',
    studentId: 'student3',
    status: 'rejected',
    requestDate: new Date('2025-05-08'),
    responseDate: new Date('2025-05-09'),
  }
];

const mockContests = [
  {
    id: 'contest1',
    title: 'Python Basics Quiz',
    startTime: new Date('2025-07-20'),
    endTime: new Date('2025-07-20'),
    timeLimit: 60,
  },
  {
    id: 'contest2',
    title: 'Data Structures Challenge',
    startTime: new Date('2025-08-05'),
    endTime: new Date('2025-08-05'),
    timeLimit: 90,
  }
];

const ClassDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRequestingJoin, setIsRequestingJoin] = useState(false);
  
  // In a real app, you would fetch this data from your API
  const classData = mockClass;
  const teacher = mockTeacher;
  
  // Mock enrollment status
  const isTeacher = user?.email === classData.teacherId;
  const isEnrolled = false;
  const hasPendingRequest = false;
  
  const handleJoinClass = () => {
    setIsRequestingJoin(true);
    
    setTimeout(() => {
      toast.success("Request to join class sent successfully");
      setIsRequestingJoin(false);
    }, 1000);
  };
  
  const handleEnrollmentAction = (enrollmentId: string, action: 'approve' | 'reject') => {
    // In a real app, you would send an API request to approve/reject
    toast.success(`Student ${action === 'approve' ? 'approved' : 'rejected'}`);
  };
  
  const handleCreateContest = () => {
    navigate(`/classes/${id}/contests/create`);
  };
  
  const handleViewContest = (contestId: string) => {
    navigate(`/coding-practice?contestId=${contestId}`);
  };
  
  if (!classData) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold">Class not found</h2>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 min-h-[90vh]">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{classData.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={classData.isFree ? "default" : "secondary"}>
                {classData.isFree ? 'Free' : `Paid: $${classData.price}`}
              </Badge>
              <Badge variant="outline">{classData.topic}</Badge>
              <CustomBadge variant={
                classData.status === 'upcoming' ? 'outline' : 
                classData.status === 'active' ? 'success' : 'secondary'
              }>
                {classData.status === 'upcoming' ? 'Upcoming' : 
                 classData.status === 'active' ? 'Active' : 'Completed'}
              </CustomBadge>
            </div>
          </div>
          
          {!isTeacher && !isEnrolled && !hasPendingRequest && (
            <Button onClick={handleJoinClass} disabled={isRequestingJoin}>
              {isRequestingJoin ? 'Sending Request...' : 'Request to Join'}
            </Button>
          )}
          
          {!isTeacher && hasPendingRequest && (
            <CustomBadge variant="secondary">Request Pending</CustomBadge>
          )}
          
          {!isTeacher && isEnrolled && (
            <CustomBadge variant="success">Enrolled</CustomBadge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">
                  Students 
                  {isTeacher && <Badge variant="outline" className="ml-2">{classData.currentStudents}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="contests">Contests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About this Class</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 whitespace-pre-line">{classData.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Start Date</p>
                          <p className="text-gray-600">
                            {classData.startDate ? format(new Date(classData.startDate), 'MMMM d, yyyy') : 'Not set'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Registration Deadline</p>
                          <p className="text-gray-600">
                            {classData.registrationDeadline ? format(new Date(classData.registrationDeadline), 'MMMM d, yyyy') : 'No deadline'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Enrollment</p>
                          <p className="text-gray-600">
                            {classData.currentStudents} students enrolled
                            {classData.maxStudents ? ` (max ${classData.maxStudents})` : ' (unlimited)'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-gray-600">{format(new Date(classData.createdAt), 'MMMM d, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>About the Teacher</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border">
                        {classData.teacherImage ? (
                          <img src={classData.teacherImage} alt={teacher.name} />
                        ) : (
                          <User className="h-8 w-8" />
                        )}
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{teacher.name}</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Qualifications</h4>
                        <p className="text-gray-700">{classData.teacherQualifications}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Areas of Expertise</h4>
                        <p className="text-gray-700">{classData.teacherExpertise}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="students" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                    <CardDescription>
                      {isTeacher ? 
                        `Manage students in your class (${classData.currentStudents} enrolled)` : 
                        `Students enrolled in this class (${classData.currentStudents} total)`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isTeacher && (
                      <>
                        <div className="mb-6">
                          <h3 className="text-base font-medium mb-4">Pending Requests</h3>
                          {mockEnrollments.filter(e => e.status === 'pending').length > 0 ? (
                            <div className="space-y-4">
                              {mockEnrollments
                                .filter(enrollment => enrollment.status === 'pending')
                                .map(enrollment => (
                                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <User className="h-4 w-4" />
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">Student {enrollment.studentId}</p>
                                        <p className="text-sm text-gray-500">
                                          Requested: {format(new Date(enrollment.requestDate), 'MMM d, yyyy')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEnrollmentAction(enrollment.id, 'approve')}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEnrollmentAction(enrollment.id, 'reject')}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No pending requests</p>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-base font-medium mb-4">Enrolled Students</h3>
                          {mockEnrollments.filter(e => e.status === 'approved').length > 0 ? (
                            <div className="space-y-3">
                              {mockEnrollments
                                .filter(enrollment => enrollment.status === 'approved')
                                .map(enrollment => (
                                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <User className="h-4 w-4" />
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">Student {enrollment.studentId}</p>
                                        <p className="text-sm text-gray-500">
                                          Joined: {format(new Date(enrollment.responseDate as Date), 'MMM d, yyyy')}
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Message
                                    </Button>
                                  </div>
                                ))
                              }
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No students enrolled yet</p>
                          )}
                        </div>
                      </>
                    )}
                    
                    {!isTeacher && (
                      <p className="text-gray-500 text-center py-6">
                        This class has {classData.currentStudents} enrolled students
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contests" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Coding Contests</CardTitle>
                      <CardDescription>
                        Participate in coding challenges for this class
                      </CardDescription>
                    </div>
                    {isTeacher && (
                      <Button onClick={handleCreateContest}>
                        Create Contest
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {mockContests.length > 0 ? (
                      <div className="space-y-4">
                        {mockContests.map(contest => (
                          <div key={contest.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div>
                              <h4 className="font-medium">{contest.title}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {format(new Date(contest.startTime), 'MMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  {contest.timeLimit} minutes
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={() => handleViewContest(contest.id)}
                            >
                              <Code className="h-4 w-4 mr-2" />
                              {isTeacher ? 'Manage' : 'View'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Book className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No contests yet</h3>
                        <p className="text-sm text-gray-500">
                          {isTeacher 
                            ? "Create your first coding contest for your students" 
                            : "The teacher hasn't created any contests yet"}
                        </p>
                        
                        {isTeacher && (
                          <Button onClick={handleCreateContest} className="mt-4">
                            Create Contest
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Class Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <CustomBadge variant={
                    classData.status === 'upcoming' ? 'outline' : 
                    classData.status === 'active' ? 'success' : 'secondary'
                  }>
                    {classData.status === 'upcoming' ? 'Upcoming' : 
                    classData.status === 'active' ? 'Active' : 'Completed'}
                  </CustomBadge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span>{classData.isFree ? 'Free' : `$${classData.price}`}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span>{classData.currentStudents}{classData.maxStudents ? `/${classData.maxStudents}` : ''}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-gray-600">Start Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {classData.startDate 
                        ? format(new Date(classData.startDate), 'MMMM d, yyyy') 
                        : 'Not set'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-gray-600">Registration Deadline</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {classData.registrationDeadline 
                        ? format(new Date(classData.registrationDeadline), 'MMMM d, yyyy') 
                        : 'No deadline'}
                    </span>
                  </div>
                </div>
                
                {isTeacher && (
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Edit Class
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;
