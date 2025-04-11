import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhyLearnSection from '@/components/WhyLearnSection';
import RoadmapSection from '@/components/RoadmapSection';
import SubtopicsSection from '@/components/SubtopicsSection';
import KeyTakeawaysSection from '@/components/KeyTakeawaysSection';
import FaqSection from '@/components/FaqSection';
import RelatedTopicsSection from '@/components/RelatedTopicsSection';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, BookOpen, Map, ListChecks, HelpCircle, LinkIcon, Check } from 'lucide-react';
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
  const [topicName, setTopicName] = useState(useParams().topicName || '');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formattedTopicName = topicName ? topicName.charAt(0).toUpperCase() + topicName.slice(1) : '';

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
        const response = await fetch('http://localhost:8000/gemini-search/search', {
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
        setTopicName(resultData["topic"])
        setLoading(false);
      } catch (err) {
        console.error("Error fetching topic data:", err);
        setError(`Failed to load data for "${formattedTopicName}". Please try again later.`);
        setLoading(false);
      }
    }
  }, [topicName, formattedTopicName]);

  const goBack = () => {
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-react-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Generating content...</h2>
            <p className="text-gray-500">Creating a comprehensive guide for {formattedTopicName}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-4 text-red-500">Oops! Something went wrong</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <Button onClick={goBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">No data found</h2>
            <Button onClick={goBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const topic = Object.keys(topicData)[0];
  const data = topicData[topic];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Button 
              variant="outline" 
              onClick={goBack} 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
            
            <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 md:ml-4">
              <Separator orientation="vertical" className="hidden md:block h-8" />
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-1.5"
                onClick={() => scrollToSection('introduction')}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Introduction
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-1.5"
                onClick={() => scrollToSection('why-learn')}
              >
                <ListChecks className="h-3.5 w-3.5" />
                Why Learn
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-1.5"
                onClick={() => scrollToSection('roadmap')}
              >
                <Map className="h-3.5 w-3.5" />
                Roadmap
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-1.5"
                onClick={() => scrollToSection('subtopics')}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Topics
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-1.5"
                onClick={() => scrollToSection('key-takeaways')}
              >
                <Check className="h-3.5 w-3.5" />
                Takeaways
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="whitespace-nowrap flex items-center gap-1.5"
                onClick={() => scrollToSection('faq')}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                FAQ
              </Button>
            </div>
          </div>
        </div>
        <HeroSection shortDescription={topicData["Short Description"]?.["Description"]?.toString() || ""} topicName={topicName} />
        <WhyLearnSection 
            needToLearn={topicData[`Need to Learn ${topicName}`]?.["Description"]?.toString() || ""}
            topicName={topicName} 
            benefit1Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 1"]?.["heading"]?.toString() || ""}
            benefit1Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 1"]?.["description"]?.toString() || ""}
            benefit2Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 2"]?.["heading"]?.toString() || ""}
            benefit2Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 2"]?.["description"]?.toString() || ""}
            benefit3Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 3"]?.["heading"]?.toString() || ""}
            benefit3Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 3"]?.["description"]?.toString() || ""}
        />
        <RoadmapSection topicName={topicName} prerequisites={topicData[`Road Map to Learn ${topicName}`]?.["Description"]?.['prerequisites'] || []} levels={topicData[`Road Map to Learn ${topicName}`]?.["Description"]?.['levels'] || []} />
        <SubtopicsSection subTopics={topicData["SubTopics"]?.["Description"]?.["subtopics"] || []} topicName={topicName} />
        <KeyTakeawaysSection keyTakeaways={topicData["Key Takeaways"]?.["Description"] || []} topicName={topicName} />
        <FaqSection topicName={topicName} frequentlyAskedQuestions={topicData["Frequently Asked Questions"]?.["Description"] || []} />
        <RelatedTopicsSection topicName={topicName} relatedTopics={topicData["Related Topics"]?.["Description"] || []} />
      </main>
      <Footer />
    </div>
  );
};

export default TopicPage;
