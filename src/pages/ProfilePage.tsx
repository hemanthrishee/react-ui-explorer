
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { BookCheck, Award, LogOut, Calendar, Clock, Check, X, BarChart3, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Sample quiz data
const SAMPLE_QUIZZES = [
  {
    id: '1',
    topic: 'React',
    subtopic: 'Hooks',
    date: '2025-04-01',
    score: 85,
    totalQuestions: 10,
    correct: 8.5,
    timeSpent: '8:45',
    questions: [
      {
        question: 'What is the purpose of useEffect hook?',
        selected: 'To perform side effects in function components',
        correct: 'To perform side effects in function components',
        isCorrect: true,
      },
      {
        question: 'When does useEffect run?',
        selected: 'After render',
        correct: 'After render',
        isCorrect: true,
      },
    ]
  },
  {
    id: '2',
    topic: 'React',
    subtopic: 'State Management',
    date: '2025-03-25',
    score: 70,
    totalQuestions: 10,
    correct: 7,
    timeSpent: '10:20',
    questions: [
      {
        question: 'What is Redux used for in React applications?',
        selected: 'For routing in React applications',
        correct: 'For global state management',
        isCorrect: false,
      },
      {
        question: 'What is the central store in Redux?',
        selected: 'A single source of truth for application state',
        correct: 'A single source of truth for application state',
        isCorrect: true,
      },
    ]
  },
  {
    id: '3',
    topic: 'JavaScript',
    subtopic: 'Promises',
    date: '2025-03-20',
    score: 90,
    totalQuestions: 10,
    correct: 9,
    timeSpent: '7:30',
    questions: [
      {
        question: 'What states can a Promise be in?',
        selected: 'Pending, Fulfilled, Rejected',
        correct: 'Pending, Fulfilled, Rejected',
        isCorrect: true,
      },
      {
        question: 'How do you chain multiple promises?',
        selected: 'Using .then()',
        correct: 'Using .then()',
        isCorrect: true,
      },
    ]
  },
  {
    id: '4',
    topic: 'TypeScript',
    subtopic: 'Interfaces',
    date: '2025-03-15',
    score: 65,
    totalQuestions: 10,
    correct: 6.5,
    timeSpent: '9:15',
    questions: [
      {
        question: 'What is the difference between interfaces and types in TypeScript?',
        selected: 'Types cannot be reopened to add new properties',
        correct: 'Types cannot be reopened to add new properties',
        isCorrect: true,
      },
      {
        question: 'Can interfaces extend classes in TypeScript?',
        selected: 'No',
        correct: 'Yes',
        isCorrect: false,
      },
    ]
  },
  {
    id: '5',
    topic: 'CSS',
    subtopic: 'Flexbox',
    date: '2025-03-10',
    score: 80,
    totalQuestions: 10,
    correct: 8,
    timeSpent: '6:50',
    questions: [
      {
        question: 'What CSS property defines the direction of flex items?',
        selected: 'flex-direction',
        correct: 'flex-direction',
        isCorrect: true,
      },
      {
        question: 'What is the default value of align-items?',
        selected: 'center',
        correct: 'stretch',
        isCorrect: false,
      },
    ]
  },
];

// Stats calculations
const topicStats = SAMPLE_QUIZZES.reduce((acc, quiz) => {
  if (!acc[quiz.topic]) {
    acc[quiz.topic] = {
      name: quiz.topic,
      quizzes: 0,
      avgScore: 0,
      totalScore: 0,
    };
  }
  acc[quiz.topic].quizzes += 1;
  acc[quiz.topic].totalScore += quiz.score;
  acc[quiz.topic].avgScore = Math.round(acc[quiz.topic].totalScore / acc[quiz.topic].quizzes);
  return acc;
}, {} as Record<string, { name: string; quizzes: number; avgScore: number; totalScore: number }>);

const topicStatsArray = Object.values(topicStats);

const monthlyProgress = [
  { name: 'Jan', quizzes: 0, avgScore: 0 },
  { name: 'Feb', quizzes: 0, avgScore: 0 },
  { name: 'Mar', quizzes: 3, avgScore: 75 },
  { name: 'Apr', quizzes: 2, avgScore: 80 },
  { name: 'May', quizzes: 0, avgScore: 0 },
  { name: 'Jun', quizzes: 0, avgScore: 0 },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('history');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      toast.error('Please sign in to view your profile');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null; // Or a loading state
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleQuizDetails = (quiz: any) => {
    setSelectedQuiz(quiz);
    setActiveTab('quiz-details');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const averageScore = SAMPLE_QUIZZES.reduce((sum, quiz) => sum + quiz.score, 0) / SAMPLE_QUIZZES.length;
  const totalQuizzes = SAMPLE_QUIZZES.length;
  const totalTopics = new Set(SAMPLE_QUIZZES.map(quiz => quiz.topic)).size;

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar / User Profile */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">{totalQuizzes}</div>
                  <div className="text-xs text-gray-500">Quizzes Taken</div>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">{Math.round(averageScore)}%</div>
                  <div className="text-xs text-gray-500">Average Score</div>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">{totalTopics}</div>
                  <div className="text-xs text-gray-500">Topics</div>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">12</div>
                  <div className="text-xs text-gray-500">Days Streak</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="w-full mt-2 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="history" className="flex items-center gap-1">
                <BookCheck className="h-4 w-4" />
                Quiz History
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Recent Quizzes</h2>
                
                <div className="space-y-3">
                  {SAMPLE_QUIZZES.map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => handleQuizDetails(quiz)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{quiz.topic} - {quiz.subtopic}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(quiz.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{quiz.timeSpent}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className={`text-lg font-bold ${quiz.score >= 80 ? 'text-green-600' : quiz.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {quiz.score}%
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span>Details</span>
                              <ChevronRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="statistics">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Quiz Performance</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Topic Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Topic Distribution</CardTitle>
                      <CardDescription>Topics you've been practicing</CardDescription>
                    </CardHeader>
                    <CardContent className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topicStatsArray}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="quizzes"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {topicStatsArray.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Average Score by Topic */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Average Score by Topic</CardTitle>
                      <CardDescription>How well you're doing in each topic</CardDescription>
                    </CardHeader>
                    <CardContent className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topicStatsArray}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="avgScore" fill="#8884d8" name="Average Score (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Monthly Progress */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Monthly Progress</CardTitle>
                      <CardDescription>Your quiz activity over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyProgress}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="quizzes" stroke="#8884d8" name="Quizzes Taken" />
                          <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#82ca9d" name="Average Score (%)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz-details">
              {selectedQuiz && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{selectedQuiz.topic} - {selectedQuiz.subtopic}</h2>
                    <Button variant="outline" onClick={() => setActiveTab('history')}>
                      Back to History
                    </Button>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz Summary</CardTitle>
                      <CardDescription>
                        Taken on {new Date(selectedQuiz.date).toLocaleDateString()} • Time spent: {selectedQuiz.timeSpent}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-500" />
                          <div>
                            <div className="text-sm text-gray-500">Score</div>
                            <div className="font-bold text-xl">{selectedQuiz.score}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookCheck className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-500">Correct Answers</div>
                            <div className="font-bold text-xl">{selectedQuiz.correct} / {selectedQuiz.totalQuestions}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-500">Time</div>
                            <div className="font-bold text-xl">{selectedQuiz.timeSpent}</div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <h3 className="font-semibold text-lg">Questions</h3>
                      
                      <div className="space-y-4">
                        {selectedQuiz.questions.map((q: any, i: number) => (
                          <Card key={i} className={q.isCorrect ? 'border-green-200' : 'border-red-200'}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-2">
                                <div className={`p-1 rounded-full mt-1 ${q.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                  {q.isCorrect ? 
                                    <Check className="h-4 w-4 text-green-600" /> : 
                                    <X className="h-4 w-4 text-red-600" />
                                  }
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium mb-2">{q.question}</p>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-gray-500">Your answer: </span>
                                      <span className={q.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                        {q.selected}
                                      </span>
                                    </div>
                                    {!q.isCorrect && (
                                      <div>
                                        <span className="text-gray-500">Correct answer: </span>
                                        <span className="text-green-600 font-medium">{q.correct}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
