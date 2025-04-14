
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface RelatedTopicsSectionProps {
  topicName: string;
  relatedTopics: Array<{
    topic: string;
    description: string;
  }>;
}

const RelatedTopicsSection: React.FC<RelatedTopicsSectionProps> = ({ topicName, relatedTopics }) => {
  return (
    <section id="related" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Related <span className="text-react-primary">Topics</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Expand your {topicName} knowledge with these complementary technologies and concepts
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedTopics.map((topic, index) => (
            <Card key={index} className="card-hover h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{topic.topic}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700">{topic.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Explore Topic
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedTopicsSection;
