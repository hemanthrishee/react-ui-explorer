
import React from 'react';
import { reactData } from '@/data/reactData';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  const { shortDescription } = reactData.react;
  
  return (
    <section id="introduction" className="py-16 bg-gradient-to-b from-react-secondary to-react-secondary/90 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Learn <span className="text-react-primary">React</span>
            </h1>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{shortDescription.description}</ReactMarkdown>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button className="bg-react-primary text-react-secondary hover:bg-react-primary/90">
                Get Started
              </Button>
              <Button variant="outline" className="border-react-primary text-react-primary hover:bg-react-primary/10">
                View Resources
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full react-logo-spin" xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348">
                  <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
                  <g stroke="#61dafb" strokeWidth="1" fill="none">
                    <ellipse rx="11" ry="4.2"/>
                    <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                    <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
