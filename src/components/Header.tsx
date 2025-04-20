import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Search, Loader2, UserCircle, Brain, ExternalLink, ChevronDown, X } from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuizTypeSelector from '@/components/QuizTypeSelector';
import { useAuth } from '@/hooks/useAuth';

const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [documentation, setDocumentation] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingDocumentation, setLoadingDocumentation] = useState(false);
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

  const handleGenerateResources = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowResourcesDialog(true);
    
    // Reset states
    setVideos([]);
    setArticles([]);
    setDocumentation([]);
    setLoadingVideos(true);
    setLoadingArticles(true);
    setLoadingDocumentation(true);

    // Extract the topic from the URL
    const topicMatch = location.pathname.match(/\/topic\/(.+)/);
    if (!topicMatch || !topicMatch[1]) {
      toast.error("Could not determine topic");
      return;
    }

    const topic = decodeURIComponent(topicMatch[1]);
    const requestBody = {
      topic_name: topic
    };

    // Load videos
    fetch(API_URL + '/gemini-search/generate-topic-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
      if (data.videos) setVideos(data.videos);
    })
    .catch(error => {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos');
    })
    .finally(() => {
      setLoadingVideos(false);
    });

    // Load articles
    fetch(API_URL + '/gemini-search/generate-topic-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
      if (data.articles) setArticles(data.articles);
    })
    .catch(error => {
      console.error('Error loading articles:', error);
      toast.error('Failed to load articles');
    })
    .finally(() => {
      setLoadingArticles(false);
    });

    // Load documentation
    fetch(API_URL + '/gemini-search/generate-topic-documentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
      if (data.documentation) setDocumentation(data.documentation);
    })
    .catch(error => {
      console.error('Error loading documentation:', error);
      toast.error('Failed to load documentation');
    })
    .finally(() => {
      setLoadingDocumentation(false);
    });
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
              {isTopicPage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-react-primary/90 to-react-primary text-black hover:from-react-primary hover:to-react-primary/90 border-react-primary/50 shadow-sm"
                    >
                      Generate
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-react-primary/20 shadow-lg">
                    <DropdownMenuItem onClick={handleGenerateQuiz} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-react-primary/5 focus:bg-react-primary/5">
                      <Brain className="h-4 w-4 text-react-primary" />
                      Generate Quiz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleGenerateResources} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-react-primary/5 focus:bg-react-primary/5">
                      <ExternalLink className="h-4 w-4 text-react-primary" />
                      Generate Resources
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            <>
              {isTopicPage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-react-primary/90 to-react-primary text-black hover:from-react-primary hover:to-react-primary/90 border-react-primary/50 shadow-sm"
                    >
                      Generate
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-react-primary/20 shadow-lg">
                    <DropdownMenuItem onClick={() => setShowAuthDialog(true)} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-react-primary/5 focus:bg-react-primary/5">
                      <Brain className="h-4 w-4 text-react-primary" />
                      Generate Quiz
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAuthDialog(true)} className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-react-primary/5 focus:bg-react-primary/5">
                      <ExternalLink className="h-4 w-4 text-react-primary" />
                      Generate Resources
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button 
                className="bg-react-primary text-react-secondary hover:bg-react-primary/90"
                onClick={() => setShowAuthDialog(true)}
              >
                Sign In
              </Button>
            </>
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

        {/* Resources Dialog */}
        <Dialog open={showResourcesDialog} onOpenChange={setShowResourcesDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 z-10">
              <div className="flex items-start justify-between">
                <div className="max-w-[calc(100%-3rem)]">
                  <DialogTitle>Learning Resources</DialogTitle>
                  <DialogDescription>
                    Curated resources to help you master this topic
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="space-y-4 mt-4">
              {/* Videos Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Videos</h3>
                {loadingVideos ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2].map((_, index) => (
                      <div key={index} className="flex flex-col bg-gray-50 rounded-lg overflow-hidden animate-pulse">
                        <div className="relative aspect-video bg-gray-200">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {videos.map((video, index) => (
                      <div key={index} className="flex flex-col bg-gray-50 rounded-lg overflow-hidden">
                        <div className="relative aspect-video">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm line-clamp-2 mb-2">{video.title}</p>
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={video.url} target="_blank" rel="noopener noreferrer">
                              Watch Video
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No videos available</p>
                )}
              </div>

              {/* Articles Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Articles & Tutorials</h3>
                {loadingArticles ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                          <div className="h-8 bg-gray-200 rounded mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : articles.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {articles.map((article, index) => (
                      <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Read time: {article.readTime}</p>
                        <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            Read Article
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No articles available</p>
                )}
              </div>

              {/* Documentation Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                {loadingDocumentation ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2].map((_, index) => (
                      <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                          <div className="h-8 bg-gray-200 rounded mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : documentation.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {documentation.map((doc, index) => (
                      <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-sm line-clamp-2">{doc.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Type: {doc.type}</p>
                        <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            View Documentation
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No documentation available</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
