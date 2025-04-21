import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface Document {
  url: string;
  title: string;
  type: string;
}

interface DocumentViewerProps {
  document: Document | null;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const handleViewInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={!!document} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:max-w-4xl xl:max-w-6xl h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] p-0 flex flex-col">
        {document && (
          <div className="flex flex-col h-full">
            <div className="p-3 sm:p-4 border-b flex-shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate">{document.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Type: {document.type}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewInNewTab(document.url)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View in new tab</span>
                <span className="sm:hidden">Open</span>
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <iframe
                src={document.url}
                title={document.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer; 