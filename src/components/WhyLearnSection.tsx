
import React from 'react';
import { reactData } from '@/data/reactData';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Award, DollarSign, Workflow } from 'lucide-react';

interface WhyLearnSectionProps {
  needToLearn: string;
  topicName: string;
  benefit1Heading: string;
  benefit1Description: string;
  benefit2Heading: string;
  benefit2Description: string;
  benefit3Heading: string;
  benefit3Description: string;
}

const WhyLearnSection: React.FC<WhyLearnSectionProps> = ({needToLearn, topicName, benefit1Heading, benefit1Description, benefit2Heading, benefit2Description, benefit3Heading, benefit3Description}) => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Learn <span className="text-react-primary">{topicName}?</span>
        </h2>
        
        <div className="prose max-w-3xl mx-auto mb-12 text-center">
          <ReactMarkdown>{needToLearn}</ReactMarkdown>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="card-hover border-t-4 border-t-react-primary">
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-react-primary/10 rounded-full">
                  <Workflow className="w-8 h-8 text-react-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{benefit1Heading}</h3>
              <p className="text-gray-600 text-center">
                {benefit1Description}
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover border-t-4 border-t-react-primary">
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-react-primary/10 rounded-full">
                  <Award className="w-8 h-8 text-react-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{benefit2Heading}</h3>
              <p className="text-gray-600 text-center">
                {benefit2Description}
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover border-t-4 border-t-react-primary">
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-react-primary/10 rounded-full">
                  <DollarSign className="w-8 h-8 text-react-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{benefit3Heading}</h3>
              <p className="text-gray-600 text-center">
                {benefit3Description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WhyLearnSection;
