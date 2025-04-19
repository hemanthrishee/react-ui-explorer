import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, BookOpen, Map, ListChecks, HelpCircle, LinkIcon, Check, Link2, Menu, X } from 'lucide-react';
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import HeroSection from '@/components/HeroSection';
import WhyLearnSection from '@/components/WhyLearnSection';
import RoadmapSection from '@/components/RoadmapSection';
import SubtopicsSection from '@/components/SubtopicsSection';
import KeyTakeawaysSection from '@/components/KeyTakeawaysSection';
import FaqSection from '@/components/FaqSection';
import RelatedTopicsSection from '@/components/RelatedTopicsSection';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  const goBack = () => {
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
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

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center mt-4 sm:mt-8 lg:mt-12">
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
      <div className="flex-grow flex items-center justify-center mt-4 sm:mt-8 lg:mt-12">
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
      <div className="flex-grow flex items-center justify-center">
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
    <div className="flex-grow">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-start w-full gap-x-2">
          <div className="flex items-center py-2 w-full lg:w-auto justify-between">
            <Button 
              variant="outline" 
              onClick={goBack} 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              className="lg:hidden flex items-center gap-2 focus:outline-none focus:ring-0 hover:bg-transparent active:bg-transparent"
              onClick={handleMenuToggle}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Navigation Menu</span>
              <span className="text-sm">Menu</span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 flex-wrap justify-end gap-1 sm:justify-between py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('introduction')}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Intro
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('why-learn')}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Why Learn
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('roadmap')}
            >
              <Map className="h-3.5 w-3.5" />
              Roadmap
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('subtopics')}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Topics
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('key-takeaways')}
            >
              <Check className="h-3.5 w-3.5" />
              Takeaways
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('faq')}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('related')}
            >
              <Link2 className="h-3.5 w-3.5" />
              Related
            </Button>
          </div>

          {/* Mobile Navigation Menu */}
          <div 
            className={`lg:hidden w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
              isMobileMenuOpen 
                ? 'opacity-100 translate-y-0 max-h-[500px] mt-0' 
                : 'opacity-0 -translate-y-2 pointer-events-none max-h-0 overflow-hidden mt-0 p-0'
            }`}
          >
            <div className={`flex flex-col gap-1 p-2 ${!isMobileMenuOpen && 'hidden'}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  scrollToSection('introduction');
                  setIsMobileMenuOpen(false);
                }}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Introduction
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  scrollToSection('why-learn');
                  setIsMobileMenuOpen(false);
                }}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                Why Learn
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  scrollToSection('roadmap');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Map className="h-4 w-4 mr-2" />
                Roadmap
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  scrollToSection('subtopics');
                  setIsMobileMenuOpen(false);
                }}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Topics
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  scrollToSection('key-takeaways');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Key Takeaways
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  scrollToSection('faq');
                  setIsMobileMenuOpen(false);
                }}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  scrollToSection('related');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Related Topics
              </Button>
            </div>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default TopicPage;
