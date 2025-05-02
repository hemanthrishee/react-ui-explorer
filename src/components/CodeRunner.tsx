
import React from 'react';

interface CodeRunnerProps {
  output: string;
}

export const CodeRunner: React.FC<CodeRunnerProps> = ({ output }) => {
  return (
    <div className="bg-gray-900 text-white rounded-md overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-medium">Console Output</span>
      </div>
      <div className="p-4 font-mono text-sm overflow-auto max-h-[300px] whitespace-pre">
        {output || 'Run your code to see output here'}
      </div>
    </div>
  );
};
