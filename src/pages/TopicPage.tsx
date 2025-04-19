import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, BookOpen, Map, ListChecks, HelpCircle, LinkIcon, Check, Link2, Menu, X, Brain } from 'lucide-react';
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import HeroSection from '@/components/HeroSection';
import WhyLearnSection from '@/components/WhyLearnSection';
import RoadmapSection from '@/components/RoadmapSection';
import SubtopicsSection from '@/components/SubtopicsSection';
import KeyTakeawaysSection from '@/components/KeyTakeawaysSection';
import FaqSection from '@/components/FaqSection';
import RelatedTopicsSection from '@/components/RelatedTopicsSection';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import QuizTypeSelector from '@/components/QuizTypeSelector';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

interface TopicData {
  [topic: string]: {
    shortDescription: {
      description: string;
    };
    needToLearnReact: {
      description: string;
    };
    subTopics: {
      description: {
        subtopics: Array<{
          name: string;
          description: string;
          difficulty: string;
          timeToComplete: string;
          whyItMatters: string;
          commonMistakes: string[];
        }>;
      };
    };
    roadMapToLearnReact: {
      description: {
        prerequisites: string[];
        levels: Array<{
          name: string;
          description: string;
          topics: string[];
          howToConquer: string;
          insiderTips: string;
        }>;
      };
    };
    keyTakeaways: {
      description: string[];
    };
    frequentlyAskedQuestions: {
      description: Array<{
        question: string;
        answer: string;
      }>;
    };
    relatedTopics: {
      description: Array<{
        topic: string;
        description: string;
      }>;
    };
  };
}

const TopicPage = () => {
  const [topicName, setTopicName] = useState<string>(useParams().topic || '');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formattedTopicName, setFormattedTopicName] = useState<string>(topicName ? topicName.charAt(0).toUpperCase() + topicName.slice(1) : '');
  const [activeSection, setActiveSection] = useState('introduction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated } = useAuth();
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (navRef.current) {
        const nav = navRef.current;
        const isOverflowing = nav.scrollWidth > nav.clientWidth;
        setShowHamburger(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  useEffect(() => {
    fetchTopicData()
    async function fetchTopicData() {
      setLoading(true);
      
      if (!topicName) {
        setError("No topic specified");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(API_URL + '/gemini-search/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            search_query: topicName,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        const resultData = await JSON.parse(data.result);
        setTopicData(resultData[resultData["topic"]]);
        setTopicName(resultData["topic"]);

        const splitTopicName = resultData["topic"].toString().split('-');
        const lastPart = splitTopicName[splitTopicName.length - 1];
        const capitalizedLastPart = lastPart
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setFormattedTopicName(capitalizedLastPart);  

        setLoading(false);
        
        window.dispatchEvent(new Event('topicContentLoaded'));
      } catch (err) {
        console.error("Error fetching topic data:", err);
        setError(`Failed to load data for "${formattedTopicName}". Please try again later.`);
        setLoading(false);
      }
    }
  }, [topicName]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px',  // Consider element visible when it's in the middle of viewport
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    const sections = [
      'introduction',
      'why-learn',
      'roadmap',
      'subtopics',
      'key-takeaways',
      'faq',
      'related'
    ];

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [topicData]); // Re-run when topicData changes as sections might not be available immediately

  const goBack = () => {
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    if (newState) {
      // When opening menu, focus the button
      menuButtonRef.current?.focus();
    } else {
      // When closing menu, remove focus and reset button state
      menuButtonRef.current?.blur();
      // Force a re-render of the button by toggling a temporary class
      menuButtonRef.current?.classList.add('reset-state');
      setTimeout(() => {
        menuButtonRef.current?.classList.remove('reset-state');
      }, 0);
    }
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
    navigate(`/quiz/${topicName}`, { state: { quizConfig } });
  };

  const handleGoToAuth = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] safe-top safe-bottom">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-react-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Generating content...</h2>
          <p className="text-gray-500">Creating a comprehensive guide for {formattedTopicName}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] safe-top safe-bottom">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">Oops! Something went wrong</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <Button onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] safe-top safe-bottom">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No data found</h2>
          <Button onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow pb-16 lg:pb-0 relative overflow-x-hidden">
      {/* Desktop Header and Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="container mx-auto px-4 safe-left safe-right">
          <div className="hidden lg:flex items-center justify-between py-3">
            {/* Desktop Back Button */}
            <Button 
              variant="outline" 
              onClick={goBack} 
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 transition-colors ${
                  activeSection === 'introduction' 
                    ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => scrollToSection('introduction')}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Intro
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 transition-colors ${
                  activeSection === 'why-learn' 
                    ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => scrollToSection('why-learn')}
              >
                <ListChecks className="h-3.5 w-3.5" />
                Why Learn
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 transition-colors ${
                  activeSection === 'roadmap' 
                    ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => scrollToSection('roadmap')}
              >
                <Map className="h-3.5 w-3.5" />
                Roadmap
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 transition-colors ${
                  activeSection === 'subtopics' 
                    ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => scrollToSection('subtopics')}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Topics
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 transition-colors ${
                  activeSection === 'key-takeaways' 
                    ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => scrollToSection('key-takeaways')}
              >
                <Check className="h-3.5 w-3.5" />
                Takeaways
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 transition-colors ${
                  activeSection === 'faq' 
                    ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => scrollToSection('faq')}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                FAQ
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1.5 transition-colors ${
                  activeSection === 'related' 
                    ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => scrollToSection('related')}
              >
                <Link2 className="h-3.5 w-3.5" />
                Related
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm lg:hidden">
        <div className="container mx-auto px-4 safe-left safe-right">
          <div className="flex items-center justify-between py-3">
            <Button 
              variant="outline" 
              onClick={goBack} 
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <button
              ref={menuButtonRef}
              onClick={handleMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                scrollToSection('introduction');
                handleMenuToggle();
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                activeSection === 'introduction' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Introduction
            </button>
            
            <button
              onClick={() => {
                scrollToSection('why-learn');
                handleMenuToggle();
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                activeSection === 'why-learn' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <ListChecks className="h-5 w-5" />
              Why Learn
            </button>
            
            <button
              onClick={() => {
                scrollToSection('roadmap');
                handleMenuToggle();
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                activeSection === 'roadmap' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Map className="h-5 w-5" />
              Roadmap
            </button>
            
            <button
              onClick={() => {
                scrollToSection('subtopics');
                handleMenuToggle();
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                activeSection === 'subtopics' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <LinkIcon className="h-5 w-5" />
              Topics
            </button>
            
            <button
              onClick={() => {
                scrollToSection('key-takeaways');
                handleMenuToggle();
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                activeSection === 'key-takeaways' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Check className="h-5 w-5" />
              Key Takeaways
            </button>
            
            <button
              onClick={() => {
                scrollToSection('faq');
                handleMenuToggle();
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                activeSection === 'faq' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <HelpCircle className="h-5 w-5" />
              FAQ
            </button>
            
            <button
              onClick={() => {
                scrollToSection('related');
                handleMenuToggle();
              }}
              className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                activeSection === 'related' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Link2 className="h-5 w-5" />
              Related Topics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 safe-left safe-right pt-4">
        <HeroSection shortDescription={topicData["Short Description"]?.["Description"]?.toString() || ""} topicName={formattedTopicName} />
        <WhyLearnSection 
            needToLearn={topicData[`Need to Learn ${topicName}`]?.["Description"]?.toString() || ""}
            topicName={formattedTopicName} 
            benefit1Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 1"]?.["heading"]?.toString() || ""}
            benefit1Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 1"]?.["description"]?.toString() || ""}
            benefit2Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 2"]?.["heading"]?.toString() || ""}
            benefit2Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 2"]?.["description"]?.toString() || ""}
            benefit3Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 3"]?.["heading"]?.toString() || ""}
            benefit3Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 3"]?.["description"]?.toString() || ""}
        />
        <RoadmapSection topicName={formattedTopicName} prerequisites={topicData[`Road Map to Learn ${topicName}`]?.["Description"]?.['prerequisites'] || []} levels={topicData[`Road Map to Learn ${topicName}`]?.["Description"]?.['levels'] || []} />
        <SubtopicsSection subTopics={topicData["SubTopics"]?.["Description"]?.["subtopics"] || []} topicName={formattedTopicName} />
        <KeyTakeawaysSection keyTakeaways={topicData["Key Takeaways"]?.["Description"] || []} topicName={formattedTopicName} />
        <FaqSection topicName={formattedTopicName} frequentlyAskedQuestions={topicData["Frequently Asked Questions"]?.["Description"] || []} />
        <RelatedTopicsSection topicName={formattedTopicName} relatedTopics={topicData["Related Topics"]?.["Description"] || []} />

        {/* Mobile Floating Action Button */}
        <motion.div
          className="lg:hidden fixed right-4 bottom-20 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={handleGenerateQuiz}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-react-primary text-react-secondary shadow-2xl relative"
            aria-label="Generate Quiz"
            whileHover={{ 
              scale: 1.1,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(97, 218, 251, 0.4)",
                "0 0 0 20px rgba(97, 218, 251, 0)",
                "0 0 0 0 rgba(97, 218, 251, 0)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Brain className="h-8 w-8" />
            <span className="sr-only">Generate Quiz</span>
            
            {/* Pulsing Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-3 border-react-primary"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Additional Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-react-primary/20 blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </motion.div>

        {/* Quiz Dialog */}
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

        {/* Auth Dialog */}
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
    </div>
  );
};

export default TopicPage;
