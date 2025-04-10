
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Search, Loader2 } from 'lucide-react';
import { toast } from "sonner";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make POST request to the specified endpoint
      const response = await fetch('http://localhost:8000/gemini-search/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_query: searchQuery,
          csrfmiddlewaretoken: '{{ csrf_token }}' // Note: This will need to be replaced with actual CSRF token
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the response data and navigate to the topic page
      localStorage.setItem('topicData', JSON.stringify(data));
      navigate(`/topic/${encodeURIComponent(searchQuery.toLowerCase())}`);
    } catch (error) {
      console.error('Error during search:', error);
      toast.error("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="ml-2 bg-react-primary text-react-secondary hover:bg-react-primary/90"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
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
