import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Search, Loader2, UserCircle } from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import QuizTypeSelector from '@/components/QuizTypeSelector';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuizButton, setShowQuizButton] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const isTopicPage = location.pathname.startsWith('/topic/');

  useEffect(() => {
    setShowQuizButton(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleTopicLoaded = () => {
      if (location.pathname.startsWith('/topic/')) {
        setShowQuizButton(true);
      }
    };

    window.addEventListener('topicContentLoaded', handleTopicLoaded);

    return () => {
      window.removeEventListener('topicContentLoaded', handleTopicLoaded);
    };
  }, [location.pathname]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    setShowQuizButton(false); // Hide quiz button during new search
    
    // Clear existing content by navigating to a temporary route
    navigate('/');
    
    // Then navigate to the search route
    setTimeout(() => {
      navigate(`/topic/${encodeURIComponent(searchQuery.toLowerCase())}`);
      setSearchQuery(''); // Clear the search input
      setIsLoading(false);
    }, 100);
  };

  const handleGenerateQuiz = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowQuizDialog(true);
  };

  const handleQuizConfigSubmit = (quizConfig: any) => {
    setShowQuizDialog(false);
    
    // Extract the topic from the URL
    const topicMatch = location.pathname.match(/\/topic\/(.+)/);
    if (topicMatch && topicMatch[1]) {
      const topic = decodeURIComponent(topicMatch[1]);
      
      // Navigate to the quiz page with the quiz configuration
      navigate(`/quiz/${topic}`, { state: { quizConfig } });
    }
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToAuth = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  return (
    <header className={`${isTopicPage ? 'lg:bg-react-secondary bg-white lg:text-white text-react-secondary' : 'bg-react-secondary text-white'} py-4`}>
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className={`flex items-center gap-2 cursor-pointer ${isTopicPage ? 'lg:text-white text-react-secondary' : 'text-white'}`} onClick={() => navigate('/')}>
          <Code size={24} className="text-react-primary" />
          <span className="text-xl font-bold">LearnFlow</span>
        </div>
        
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-12 max-w-md">
          <div className="relative w-full">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isTopicPage ? 'lg:text-gray-400 text-gray-500' : 'text-gray-400'}`} />
            <Input
              type="text"
              placeholder="Search any technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 ${isTopicPage ? 'lg:bg-react-secondary/80 lg:border-gray-600 lg:text-white lg:placeholder:text-gray-400 bg-white border-gray-200 text-react-secondary placeholder:text-gray-500' : 'bg-react-secondary/80 border-gray-600 text-white placeholder:text-gray-400'}`}
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="ml-2 bg-react-primary text-react-secondary hover:bg-react-primary/90"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </form>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {showQuizButton && (
                <Button 
                  className="bg-react-primary text-react-secondary hover:bg-react-primary/90"
                  onClick={handleGenerateQuiz}
                >
                  Generate Quiz
                </Button>
              )}
              <Button 
                variant="ghost" 
                className={`${isTopicPage ? 'lg:text-white text-react-secondary hover:text-react-primary' : 'text-white hover:text-react-primary'}`}
                onClick={handleGoToProfile}
              >
                <UserCircle className="h-5 w-5 mr-1" />
                Profile
              </Button>
            </>
          ) : (
            <Button 
              className="bg-react-primary text-react-secondary hover:bg-react-primary/90"
              onClick={() => setShowAuthDialog(true)}
            >
              Sign In
            </Button>
          )}
        </div>

        <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Quiz Configuration</DialogTitle>
              <DialogDescription>
                Customize your quiz settings
              </DialogDescription>
            </DialogHeader>
            <QuizTypeSelector onClose={() => setShowQuizDialog(false)} onSubmit={handleQuizConfigSubmit} />
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
    </header>
  );
};

export default Header;
