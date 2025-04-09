
import React, { useState } from 'react';
import { reactData } from '@/data/reactData';
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
import { Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubTopic {
  name: string;
  description: string;
  difficulty: string;
  timeToComplete: string;
  whyItMatters: string;
  commonMistakes: string[];
}

const SubtopicsSection: React.FC = () => {
  const { subTopics } = reactData.react;
  const [selectedTopic, setSelectedTopic] = useState<SubTopic | null>(null);
  
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
  
  return (
    <section id="subtopics" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          React <span className="text-react-primary">Topics</span> to Master
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore these key React concepts to build a strong foundation and advance your skills
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subTopics.description.subtopics.map((topic, index) => (
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
