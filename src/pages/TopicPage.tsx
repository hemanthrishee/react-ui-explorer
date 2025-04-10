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

  useEffect(() => {
    const storedData = localStorage.getItem('topicData');
    
    if (storedData) {
      try {
        setTopicData(JSON.parse(storedData));
        setLoading(false);
        return;
      } catch (err) {
        console.error("Error parsing stored data:", err);
      }
    }
    
    setLoading(true);
    
    const fetchTopicData = async () => {
      try {
        setTimeout(() => {
          if (topicName?.toLowerCase() === 'react') {
            const mockData: TopicData = {
              react: {
                shortDescription: {
                  description: "**React** is a popular **JavaScript library** primarily used for building dynamic and interactive **user interfaces (UIs)** for web applications. Think of it as a toolkit for creating reusable UI pieces called **components**. Instead of updating the entire webpage, React cleverly updates only the parts that change, making apps feel much faster and smoother. This is achieved through its **virtual DOM**. It's declarative, meaning you describe *what* the UI should look like for a given state, and React handles the *how*. It's widely used for **single-page applications** and is backed by Facebook, ensuring strong community support and continuous development."
                },
                needToLearnReact: {
                  description: "Learning **React** opens doors to building modern, high-performance web applications. Its component-based structure promotes code reusability and maintainability. Mastering React significantly boosts your employability in the thriving front-end development job market, empowering you to create engaging user experiences."
                },
                subTopics: {
                  description: {
                    subtopics: [
                      {
                        name: "JSX (JavaScript XML)",
                        description: "Learn JSX, a syntax extension for JavaScript recommended for use with React. It allows you to write HTML-like structures directly within your JavaScript code, making component rendering intuitive and visually similar to the final output in the browser.",
                        difficulty: "Beginner",
                        timeToComplete: "2 hours",
                        whyItMatters: "JSX simplifies the process of describing UI structure within React components, making code more readable and easier to visualize.",
                        commonMistakes: [
                          "Forgetting JSX needs a single parent element.",
                          "Using 'class' instead of 'className' for CSS classes.",
                          "Incorrectly embedding JavaScript expressions using curly braces."
                        ]
                      },
                      // ... more subtopics would be here
                    ]
                  }
                },
                roadMapToLearnReact: {
                  description: {
                    prerequisites: [
                      "Solid understanding of **HTML**: Structure of web pages, elements, attributes.",
                      "Strong grasp of **CSS**: Styling elements, layout (Flexbox/Grid), responsiveness.",
                      "Proficiency in **JavaScript (ES6+)**: Variables, data types, functions, arrays, objects, classes, modules, Promises, async/await."
                    ],
                    levels: [
                      {
                        name: "Basic Level",
                        topics: [
                          "Setting up a React development environment (Node.js, npm/yarn, Create React App).",
                          "Understanding JSX syntax and its role.",
                          "Creating functional and class components.",
                          "Passing data using Props.",
                          "Managing component state with `useState` Hook or `this.state`/`setState`.",
                          "Handling user events (onClick, onChange)."
                        ],
                        howToConquer: "Follow the official React tutorial. Build simple components like buttons, counters, and input forms. Focus on understanding the core concepts one by one.",
                        insiderTips: "Don't try to learn everything at once. Solidify your understanding of JavaScript fundamentals first. Use browser developer tools extensively to inspect components, props, and state. Read the official React documentation – it's excellent."
                      },
                      // ... more levels would be here
                    ]
                  }
                },
                keyTakeaways: {
                  description: [
                    "React is a JavaScript library for building user interfaces with reusable components.",
                    "It uses a Virtual DOM for efficient updates and performance.",
                    "JSX allows writing HTML-like syntax within JavaScript.",
                    "State and Props are fundamental for managing data and component interaction.",
                    "Hooks (like `useState`, `useEffect`) enable state and side effects in functional components.",
                    "Mastering React requires strong JavaScript fundamentals and continuous practice."
                  ]
                },
                frequentlyAskedQuestions: {
                  description: [
                    {
                      question: "Is React a framework or a library?",
                      answer: "React is officially described as a JavaScript library for building user interfaces. While it can form the core of a framework (like Next.js), React itself focuses primarily on the view layer."
                    },
                    // ... more FAQs would be here
                  ]
                },
                relatedTopics: {
                  description: [
                    {
                      topic: "JavaScript (ES6+)",
                      description: "The language React is built upon. Deep understanding is crucial."
                    },
                    // ... more related topics would be here
                  ]
                }
              }
            };
            setTopicData(mockData);
            setLoading(false);
          } else {
            setError(`No data available for "${topicName}". Try searching for "React" for a demo.`);
            setLoading(false);
          }
        }, 1500);
      } catch (err) {
        console.error("Error fetching topic data:", err);
        setError("Failed to load topic data. Please try again later.");
        setLoading(false);
      }
    };

    if (topicName) {
      fetchTopicData();
    }
  }, [topicName]);

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
            <p className="text-gray-500">Creating a comprehensive guide for {topicName}</p>
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
