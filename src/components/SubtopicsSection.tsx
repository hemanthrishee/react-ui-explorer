
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, ExternalLink, BookCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QuizTypeSelector from './QuizTypeSelector';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SubTopic {
  name: string;
  description: string;
  difficulty: string;
  timeToComplete: string;
  whyItMatters: string;
  commonMistakes: string[];
}

interface SubTopicsSectionProps {
  subTopics: Array<SubTopic>;
  topicName: string;
}

const SubtopicsSection: React.FC<SubTopicsSectionProps> = ({ subTopics, topicName }) => {
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<SubTopic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenDetails = (topic: SubTopic) => {
    setSelectedTopic(topic);
  };
  
  const handleGenerateQuiz = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowQuizDialog(true);
  };

  const handleQuizConfigSubmit = (quizConfig: any, subTopic: string) => {
    setShowQuizDialog(false);
    setIsLoading(true);
    
    // Clear existing content by navigating to a temporary route
    
    // Extract the topic from the URL
    const topicMatch = location.pathname.match(/\/topic\/(.+)/);
    if (topicMatch && topicMatch[1]) {
      const topic = decodeURIComponent(topicMatch[1]);
      
      // Navigate to the quiz page with the quiz configuration after a short delay
      setTimeout(() => {
        navigate(`/quiz/${topic}`, { state: { quizConfig, subTopic } });
        setIsLoading(false);
      }, 100);
    }
  };

  const handleGoToAuth = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  return (
    <section id="subtopics" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          {topicName} <span className="text-react-primary">Topics</span> to Master
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore these key {topicName} concepts to build a strong foundation and advance your skills
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subTopics.map((topic, index) => (
            <Card key={index} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{topic.name}</CardTitle>
                  <Badge className={getDifficultyColor(topic.difficulty)}>
                    {topic.difficulty}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{topic.timeToComplete}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-3">{topic.description}</p>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleOpenDetails(topic as SubTopic)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  {selectedTopic && (
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <div className="flex items-center justify-between">
                          <DialogTitle>{selectedTopic.name}</DialogTitle>
                          <Badge className={getDifficultyColor(selectedTopic.difficulty)}>
                            {selectedTopic.difficulty}
                          </Badge>
                        </div>
                        <DialogDescription className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{selectedTopic.timeToComplete}</span>
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-2">
                        <div>
                          <p className="text-gray-700">{selectedTopic.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-1">Why It Matters</h4>
                          <p className="text-gray-700">{selectedTopic.whyItMatters}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-1">Common Mistakes</h4>
                          <ul className="space-y-2">
                            {selectedTopic.commonMistakes.map((mistake, i) => (
                              <li key={i} className="flex gap-2 items-start">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-700">{mistake}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="pt-2">
                          <Button className="w-full bg-react-primary text-react-secondary hover:bg-react-primary/90">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Generate Resources
                          </Button>
                        </div>
                        <div className="pt-2">
                          <Button 
                            className="w-full bg-react-dark text-react-light hover:bg-react-dark/90"
                            onClick={handleGenerateQuiz}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <BookCheck className="h-4 w-4 mr-2" />
                            )}
                            {isLoading ? "Loading..." : "Generate Quiz"}
                          </Button>
                        </div>
                        <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Quiz Configuration</DialogTitle>
                              <DialogDescription>
                                Customize your quiz settings
                              </DialogDescription>
                            </DialogHeader>
                            <QuizTypeSelector 
                              onClose={() => setShowQuizDialog(false)} 
                              onSubmit={(quizConfig) => handleQuizConfigSubmit(quizConfig, selectedTopic.name)} 
                            />
                          </DialogContent>
                        </Dialog>
                        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Authentication Required</DialogTitle>
                              <DialogDescription>
                                You need to sign in to generate quizzes
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-4 mt-4">
                              <p className="text-center text-gray-600">Sign in to track your quiz history and progress</p>
                              <Button onClick={handleGoToAuth} className="bg-react-primary text-react-secondary hover:bg-react-primary/90">
                                Go to Sign In
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubtopicsSection;
