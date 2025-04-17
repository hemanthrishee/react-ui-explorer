import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { 
  BookCheck, 
  Award, 
  LogOut, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  BarChart3, 
  ChevronRight, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  AlertCircle,
  ChevronDown 
} from 'lucide-react';
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
    negativeMarking: true,
    question_type: 'mcq',
    questions: [
      {
        question: 'What is the purpose of useEffect hook?',
        options: [
          'To perform side effects in function components',
          'To manage state in class components',
          'To create custom hooks',
          'To handle routing in React'
        ],
        correctAnswers: [0],
        selectedAnswers: [0],
        isCorrect: true,
        score: 4,
        explanation: 'useEffect is used to perform side effects in function components, such as data fetching, subscriptions, or manually changing the DOM.'
      }
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
    question_type: 'multiple-correct',
    questions: [
      {
        question: 'Which of these are valid React hooks?',
        options: [
          'useState',
          'useEffect',
          'useContext',
          'useClass'
        ],
        correctAnswers: [0, 1, 2],
        selectedAnswers: [0, 1],
        isCorrect: false,
        partiallyCorrect: true,
        score: 2,
        explanation: 'useState, useEffect, and useContext are valid React hooks. useClass is not a valid hook.'
      }
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
    question_type: 'true-false',
    questions: [
      {
        question: 'A Promise can be in one of three states: pending, fulfilled, or rejected.',
        options: ['True', 'False'],
        correctAnswers: [0],
        selectedAnswers: [0],
        isCorrect: true,
        score: 4
      }
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
    question_type: 'mcq',
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
    question_type: 'mcq',
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
      questionTypes: {
        'mcq': 0,
        'multiple-correct': 0,
        'true-false': 0
      }
    };
  }
  acc[quiz.topic].quizzes += 1;
  acc[quiz.topic].totalScore += quiz.score;
  acc[quiz.topic].avgScore = Math.round(acc[quiz.topic].totalScore / acc[quiz.topic].quizzes);
  acc[quiz.topic].questionTypes[quiz.question_type] += 1;
  return acc;
}, {} as Record<string, { 
  name: string; 
  quizzes: number; 
  avgScore: number; 
  totalScore: number;
  questionTypes: Record<string, number>;
}>);

const topicStatsArray = Object.values(topicStats);

// Calculate overall question type distribution
const questionTypeStats = SAMPLE_QUIZZES.reduce((acc, quiz) => {
  if (!acc[quiz.question_type]) {
    acc[quiz.question_type] = 0;
  }
  acc[quiz.question_type] += 1;
  return acc;
}, {} as Record<string, number>);

const questionTypeData = Object.entries(questionTypeStats).map(([name, value]) => ({
  name,
  value
}));

const monthlyProgress = [
  { name: 'Jan', quizzes: 0, avgScore: 0 },
  { name: 'Feb', quizzes: 0, avgScore: 0 },
  { name: 'Mar', quizzes: 3, avgScore: 75 },
  { name: 'Apr', quizzes: 2, avgScore: 80 },
  { name: 'May', quizzes: 0, avgScore: 0 },
  { name: 'Jun', quizzes: 0, avgScore: 0 },
];

// Additional stats calculations
const scoreDistribution = SAMPLE_QUIZZES.reduce((acc, quiz) => {
  const range = Math.floor(quiz.score / 10) * 10;
  const key = `${range}-${range + 9}`;
  if (!acc[key]) {
    acc[key] = 0;
  }
  acc[key] += 1;
  return acc;
}, {} as Record<string, number>);

const scoreDistributionData = Object.entries(scoreDistribution).map(([range, count]) => ({
  range,
  count
}));

const timeAnalysis = SAMPLE_QUIZZES.map(quiz => {
  const [minutes, seconds] = quiz.timeSpent.split(':').map(Number);
  return {
    topic: quiz.topic,
    timeInMinutes: minutes + seconds / 60,
    score: quiz.score
  };
});

const performanceByQuestionType = SAMPLE_QUIZZES.reduce((acc, quiz) => {
  if (!acc[quiz.question_type]) {
    acc[quiz.question_type] = {
      total: 0,
      correct: 0,
      time: 0
    };
  }
  acc[quiz.question_type].total += 1;
  acc[quiz.question_type].correct += quiz.correct;
  acc[quiz.question_type].time += parseInt(quiz.timeSpent.split(':')[0]) * 60 + parseInt(quiz.timeSpent.split(':')[1]);
  return acc;
}, {} as Record<string, { total: number; correct: number; time: number }>);

const performanceByQuestionTypeData = Object.entries(performanceByQuestionType).map(([type, data]) => ({
  type,
  accuracy: (data.correct / (data.total * 10)) * 100, // Assuming 10 questions per quiz
  avgTime: data.time / data.total
}));

// Add score progression data
const scoreProgression = SAMPLE_QUIZZES
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((quiz, index) => ({
    date: new Date(quiz.date).toLocaleDateString(),
    score: quiz.score,
    topic: quiz.topic,
    cumulativeAvg: SAMPLE_QUIZZES
      .slice(0, index + 1)
      .reduce((sum, q) => sum + q.score, 0) / (index + 1)
  }));

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
};

// Animation styles
const animationStyles = {
  fadeIn: 'opacity-0 translate-y-4',
  fadeInLeft: 'opacity-0 -translate-x-4',
  fadeInRight: 'opacity-0 translate-x-4',
  fadeInUp: 'opacity-0 -translate-y-4',
  scaleIn: 'opacity-0 scale-95',
  rotateIn: 'opacity-0 rotate-3',
};

const animationTransitions = {
  fadeIn: 'opacity-100 translate-y-0',
  fadeInLeft: 'opacity-100 translate-x-0',
  fadeInRight: 'opacity-100 translate-x-0',
  fadeInUp: 'opacity-100 translate-y-0',
  scaleIn: 'opacity-100 scale-100',
  rotateIn: 'opacity-100 rotate-0',
};

// Animated Chart Component
const AnimatedChart = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('history');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Group quizzes by topic
  const quizzesByTopic = SAMPLE_QUIZZES.reduce((acc, quiz) => {
    if (!acc[quiz.topic]) {
      acc[quiz.topic] = [];
    }
    acc[quiz.topic].push(quiz);
    return acc;
  }, {} as Record<string, typeof SAMPLE_QUIZZES>);

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

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
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
                variant="default" 
                onClick={() => navigate(-1)} 
                className="w-full"
              >
                Return
              </Button>
              
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
                <h2 className="text-2xl font-bold">Quiz History</h2>
                
                {!selectedTopic ? (
                  // Show topics list
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(quizzesByTopic).map((topic) => (
                      <Card 
                        key={topic} 
                        className="hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleTopicSelect(topic)}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <h3 className="text-xl font-semibold mb-2">{topic}</h3>
                            <p className="text-sm text-gray-500">
                              {quizzesByTopic[topic].length} {quizzesByTopic[topic].length === 1 ? 'quiz' : 'quizzes'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Show quizzes for selected topic
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBackToTopics}
                        className="flex items-center gap-1"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Back to Topics
                      </Button>
                      <h3 className="text-xl font-semibold">{selectedTopic}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {quizzesByTopic[selectedTopic].map((quiz, index) => (
                        <Card 
                          key={quiz.id} 
                          className="hover:shadow-md transition-all cursor-pointer" 
                          onClick={() => handleQuizDetails(quiz)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                  {quiz.subtopic || `General Test ${index + 1}`}
                                </h3>
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
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="statistics">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Quiz Performance</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Score Progression */}
                  <AnimatedChart className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Score Progression</CardTitle>
                        <CardDescription>Your learning journey over time</CardDescription>
                      </CardHeader>
                      <CardContent className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={scoreProgression}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#8884d8" 
                              name="Quiz Score" 
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="cumulativeAvg" 
                              stroke="#82ca9d" 
                              name="Cumulative Average" 
                              strokeDasharray="5 5"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </AnimatedChart>

                  {/* Score Distribution */}
                  <AnimatedChart>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Score Distribution</CardTitle>
                        <CardDescription>How your scores are distributed</CardDescription>
                      </CardHeader>
                      <CardContent className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={scoreDistributionData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" name="Number of Quizzes" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </AnimatedChart>

                  {/* Question Type Distribution */}
                  <AnimatedChart>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Question Type Distribution</CardTitle>
                        <CardDescription>Types of questions you've attempted</CardDescription>
                      </CardHeader>
                      <CardContent className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={questionTypeData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {questionTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </AnimatedChart>

                  {/* Time vs Score Analysis */}
                  <AnimatedChart>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Time vs Score Analysis</CardTitle>
                        <CardDescription>Relationship between time taken and scores</CardDescription>
                      </CardHeader>
                      <CardContent className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="timeInMinutes" name="Time (minutes)" />
                            <YAxis type="number" dataKey="score" name="Score" domain={[0, 100]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter data={timeAnalysis} fill="#8884d8" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </AnimatedChart>

                  {/* Performance by Question Type */}
                  <AnimatedChart>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance by Question Type</CardTitle>
                        <CardDescription>Accuracy and time taken for different question types</CardDescription>
                      </CardHeader>
                      <CardContent className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={performanceByQuestionTypeData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" />
                            <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="accuracy" fill="#8884d8" name="Accuracy (%)" />
                            <Bar yAxisId="right" dataKey="avgTime" fill="#82ca9d" name="Avg Time (seconds)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </AnimatedChart>

                  {/* Question Types by Topic */}
                  <AnimatedChart className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Question Types by Topic</CardTitle>
                        <CardDescription>Distribution of question types in each topic</CardDescription>
                      </CardHeader>
                      <CardContent className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topicStatsArray}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="questionTypes.mcq" stackId="a" fill="#0088FE" name="MCQ" />
                            <Bar dataKey="questionTypes.multiple-correct" stackId="a" fill="#00C49F" name="Multiple Correct" />
                            <Bar dataKey="questionTypes.true-false" stackId="a" fill="#FFBB28" name="True/False" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </AnimatedChart>

                  {/* Topic Performance Comparison */}
                  <AnimatedChart className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Topic Performance Comparison</CardTitle>
                        <CardDescription>Detailed performance metrics across topics</CardDescription>
                      </CardHeader>
                      <CardContent className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topicStatsArray}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="avgScore" fill="#8884d8" name="Average Score (%)" />
                            <Bar yAxisId="right" dataKey="quizzes" fill="#82ca9d" name="Number of Quizzes" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </AnimatedChart>
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
                        {selectedQuiz.questions.map((q: any, i: number) => {
                          const isSkipped = !q.selectedAnswers || q.selectedAnswers.length === 0;
                          
                          return (
                            <div 
                              key={i} 
                              className={`p-4 rounded-lg border ${
                                q.isCorrect 
                                  ? 'border-green-200 bg-green-50' 
                                  : q.partiallyCorrect 
                                    ? 'border-amber-200 bg-amber-50'
                                    : isSkipped
                                      ? 'border-slate-200 bg-slate-50'
                                      : 'border-red-200 bg-red-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Question {i + 1}</h4>
                                {q.isCorrect ? (
                                  <span className="flex items-center text-green-600 text-sm font-medium">
                                    <Check className="h-4 w-4 mr-1" /> Correct (+{q.score})
                                  </span>
                                ) : isSkipped ? (
                                  <span className="flex items-center text-slate-600 text-sm font-medium">
                                    <HelpCircle className="h-4 w-4 mr-1" /> Not Attempted
                                  </span>
                                ) : q.partiallyCorrect ? (
                                  <span className="flex items-center text-amber-600 text-sm font-medium">
                                    <AlertCircle className="h-4 w-4 mr-1" /> Partially Correct (+{q.score})
                                  </span>
                                ) : (
                                  <span className="flex items-center text-red-600 text-sm font-medium">
                                    <X className="h-4 w-4 mr-1" /> 
                                    Incorrect {selectedQuiz.negativeMarking ? `(${q.score})` : ''}
                                  </span>
                                )}
                              </div>
                              
                              <p className="mt-2">{q.question}</p>
                              
                              <div className="mt-3 space-y-2">
                                {q.options.map((option: string, optIdx: number) => {
                                  const isUserSelected = q.selectedAnswers?.includes(optIdx);
                                  const isCorrectOption = q.correctAnswers.includes(optIdx);
                                  
                                  let className = "pl-2 py-1 border-l-2 ";
                                  
                                  if (isUserSelected && isCorrectOption) {
                                    className += "border-green-500 bg-green-100";
                                  } else if (isUserSelected && !isCorrectOption) {
                                    className += "border-red-500 bg-red-100";
                                  } else if (!isUserSelected && isCorrectOption) {
                                    className += "border-amber-500 bg-amber-100";
                                  } else {
                                    className += "border-transparent";
                                  }
                                  
                                  return (
                                    <div key={optIdx} className={className}>
                                      <div className="flex items-start gap-2">
                                        {selectedQuiz.question_type === 'multiple-correct' ? (
                                          isCorrectOption ? (
                                            <CheckSquare className="h-4 w-4 text-green-600 mt-0.5" />
                                          ) : (
                                            <Square className="h-4 w-4 text-slate-400 mt-0.5" />
                                          )
                                        ) : (
                                          <div className="relative flex h-4 w-4 items-center justify-center">
                                            <div className={`h-3 w-3 rounded-full ${isCorrectOption ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                          </div>
                                        )}
                                        <span>{option}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {q.explanation && (
                                <div className="mt-4 text-sm bg-white p-3 rounded border border-slate-200">
                                  <span className="font-medium">Explanation:</span> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
