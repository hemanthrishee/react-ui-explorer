
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Search } from 'lucide-react';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/topic/${encodeURIComponent(searchQuery.toLowerCase())}`);
    }
  };

  return (
    <header className="bg-react-secondary text-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Code size={24} className="text-react-primary" />
          <span className="text-xl font-bold">TechExplorer</span>
        </div>
        
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-12 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search any technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-react-secondary/80 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          <Button type="submit" className="ml-2 bg-react-primary text-react-secondary hover:bg-react-primary/90">
            Search
          </Button>
        </form>
        
        <Button className="bg-react-primary text-react-secondary hover:bg-react-primary/90">
          Generate Quiz
        </Button>
      </div>
    </header>
  );
};

export default Header;
