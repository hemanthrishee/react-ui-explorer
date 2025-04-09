
import React from 'react';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-react-secondary text-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Code size={24} className="text-react-primary" />
          <span className="text-xl font-bold">ReactExplorer</span>
        </div>
        
        <nav className="hidden md:flex space-x-6 text-sm">
          <a href="#introduction" className="hover:text-react-primary transition-colors">Introduction</a>
          <a href="#roadmap" className="hover:text-react-primary transition-colors">Roadmap</a>
          <a href="#subtopics" className="hover:text-react-primary transition-colors">Topics</a>
          <a href="#faq" className="hover:text-react-primary transition-colors">FAQ</a>
          <a href="#related" className="hover:text-react-primary transition-colors">Related</a>
        </nav>
        
        <Button className="bg-react-primary text-react-secondary hover:bg-react-primary/90">
          Generate Quiz
        </Button>
      </div>
    </header>
  );
};

export default Header;
