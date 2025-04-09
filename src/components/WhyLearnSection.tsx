
import React from 'react';
import { reactData } from '@/data/reactData';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Award, DollarSign, Workflow } from 'lucide-react';

const WhyLearnSection: React.FC = () => {
  const { needToLearnReact } = reactData.react;
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Learn <span className="text-react-primary">React?</span>
        </h2>
        
        <div className="prose max-w-3xl mx-auto mb-12 text-center">
          <ReactMarkdown>{needToLearnReact.description}</ReactMarkdown>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="card-hover border-t-4 border-t-react-primary">
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-react-primary/10 rounded-full">
                  <Workflow className="w-8 h-8 text-react-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Component-Based</h3>
              <p className="text-gray-600 text-center">
                Build encapsulated components that manage their own state, then compose them to make complex UIs.
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
              <h3 className="text-xl font-semibold text-center mb-2">Industry Standard</h3>
              <p className="text-gray-600 text-center">
                Used by thousands of companies including Facebook, Instagram, Netflix, and Airbnb.
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
              <h3 className="text-xl font-semibold text-center mb-2">High Demand</h3>
              <p className="text-gray-600 text-center">
                React developers are among the highest-paid front-end specialists in the job market.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WhyLearnSection;
