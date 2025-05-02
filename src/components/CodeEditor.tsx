
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CodeEditorProps {
  code: string;
  language?: string;
  onChange: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language = 'javascript', 
  onChange 
}) => {
  const [lines, setLines] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (code) {
      setLines(code.split('\n'));
    }
  }, [code]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    onChange(newCode);
    setLines(newCode.split('\n'));
  };

  const lineNumbers = Array.from({ length: lines.length }, (_, i) => i + 1);

  return (
    <div className="rounded-md border bg-background relative font-mono text-sm overflow-hidden">
      <div className="flex relative">
        {!isMobile && (
          <div className="bg-muted w-[60px] text-right py-3 flex-shrink-0 select-none border-r">
            {lineNumbers.map(num => (
              <div key={num} className="text-xs text-muted-foreground pr-2">
                {num}
              </div>
            ))}
          </div>
        )}
        <textarea
          value={code}
          onChange={handleTextareaChange}
          className="min-h-[300px] w-full bg-transparent p-3 outline-none resize-none font-mono"
          style={{ lineHeight: '1.5', tabSize: 2 }}
          spellCheck="false"
        />
      </div>
    </div>
  );
};
