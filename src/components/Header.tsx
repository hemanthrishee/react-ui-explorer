import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Search, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import QuizTypeSelector from '@/components/QuizTypeSelector';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuizButton, setShowQuizButton] = useState(false);

  useEffect(() => {
    const isTopicPage = location.pathname.startsWith('/topic/');
    
    if (isTopicPage) {
      setShowQuizButton(false);
    } else {
      setShowQuizButton(false);
    }
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
    navigate(`/topic/${encodeURIComponent(searchQuery.toLowerCase())}`);
  };

  const handleGenerateQuiz = () => {
    setShowQuizDialog(true);
  };

  return (
    <header className="bg-react-secondary text-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Code size={24} className="text-react-primary" />
          <span className="text-xl font-bold">LearnFlow</span>
        </div>
        
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-12 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search any technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-react-secondary/80 border-gray-600 text-white placeholder:text-gray-400"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="ml-2 bg-react-primary text-react-secondary hover:bg-react-primary/90"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </form>
        
        {showQuizButton && (
          <Button 
            className="bg-react-primary text-react-secondary hover:bg-react-primary/90"
            onClick={handleGenerateQuiz}
          >
            Generate Quiz
          </Button>
        )}

        <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Quiz Configuration</DialogTitle>
              <DialogDescription>
                Customize your quiz settings
              </DialogDescription>
            </DialogHeader>
            <QuizTypeSelector onClose={() => setShowQuizDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
