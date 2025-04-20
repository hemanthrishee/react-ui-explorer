import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';

interface ResourcesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  topicName: string;
  subtopicName?: string;
  videos: any[];
  articles: any[];
  documentation: any[];
  loadingVideos: boolean;
  loadingArticles: boolean;
  loadingDocumentation: boolean;
}

const ResourcesDialog: React.FC<ResourcesDialogProps> = ({
  isOpen,
  onOpenChange,
  topicName,
  subtopicName,
  videos,
  articles,
  documentation,
  loadingVideos,
  loadingArticles,
  loadingDocumentation,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] lg:max-h-[90vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 z-10">
          <div className="flex items-start justify-between">
            <div className="max-w-[calc(100%-3rem)]">
              <DialogTitle>Learning Resources for {subtopicName || topicName}</DialogTitle>
              <DialogDescription>
                Curated resources to help you master this topic
              </DialogDescription>
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-4">
          {/* Videos Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Videos</h3>
            {loadingVideos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map((_, index) => (
                  <div key={index} className="flex flex-col bg-gray-50 rounded-lg overflow-hidden animate-pulse">
                    <div className="relative aspect-video bg-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {videos.map((video, index) => (
                  <div key={index} className="flex flex-col bg-gray-50 rounded-lg overflow-hidden">
                    <div className="relative aspect-video">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-2 mb-2">{video.title}</p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          Watch Video
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No videos available</p>
            )}
          </div>

          {/* Articles Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Articles & Tutorials</h3>
            {loadingArticles ? (
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      <div className="h-8 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {articles.map((article, index) => (
                  <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Read time: {article.readTime}</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        Read Article
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No articles available</p>
            )}
          </div>

          {/* Documentation Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Documentation</h3>
            {loadingDocumentation ? (
              <div className="grid grid-cols-1 gap-3">
                {[1, 2].map((_, index) => (
                  <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                      <div className="h-8 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : documentation.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {documentation.map((doc, index) => (
                  <div key={index} className="flex flex-col bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-sm line-clamp-2">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Type: {doc.type}</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        View Documentation
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No documentation available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcesDialog; 