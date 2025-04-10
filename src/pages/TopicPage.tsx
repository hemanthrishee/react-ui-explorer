
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from "sonner";

// Type for the JSON data structure
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
  const { topicName } = useParams<{ topicName: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formattedTopicName = topicName ? topicName.charAt(0).toUpperCase() + topicName.slice(1) : '';

  useEffect(() => {
    // Get data from localStorage first (which would be set from the search)
    const storedData = localStorage.getItem('topicData');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setTopicData(parsedData);
        setLoading(false);
        
        // If the data is empty or doesn't have the expected structure
        if (!parsedData || Object.keys(parsedData).length === 0) {
          // In this case, we'll try to fetch directly instead of showing an error
          fetchTopicData();
        }
        return;
      } catch (err) {
        console.error("Error parsing stored data:", err);
        // If there's an error parsing, we'll try to fetch directly
        fetchTopicData();
        return;
      }
    }
    
    // If no data in localStorage, fetch it directly
    fetchTopicData();
    
    async function fetchTopicData() {
      setLoading(true);
      
      if (!topicName) {
        setError("No topic specified");
        setLoading(false);
        return;
      }
      
      try {
        // Call the API to get data for the specified topic
        const response = await fetch('http://localhost:8000/gemini-search/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            search_query: topicName,
            csrfmiddlewaretoken: '{{ csrf_token }}' // This will need to be replaced with a proper CSRF token
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store the data in localStorage and state
        localStorage.setItem('topicData', JSON.stringify(data));
        setTopicData(data);
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
          <Button 
            variant="outline" 
            onClick={goBack} 
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </div>
        <HeroSection />
        <WhyLearnSection />
        <RoadmapSection />
        <SubtopicsSection />
        <KeyTakeawaysSection />
        <FaqSection />
        <RelatedTopicsSection />
      </main>
      <Footer />
    </div>
  );
};

export default TopicPage;
