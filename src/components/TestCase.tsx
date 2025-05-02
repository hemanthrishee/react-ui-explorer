
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface TestCaseProps {
  index: number;
  input: string;
  output: string;
  explanation?: string;
}

export const TestCase: React.FC<TestCaseProps> = ({
  index,
  input,
  output,
  explanation
}) => {
  return (
    <Accordion type="single" collapsible className="w-full border rounded-md mb-3 overflow-hidden">
      <AccordionItem value={`example-${index}`} className="border-none">
        <AccordionTrigger className="px-3 py-2 hover:bg-gray-50">
          <span className="text-sm font-medium">Example {index}</span>
        </AccordionTrigger>
        <AccordionContent className="px-3 py-2 bg-gray-50 border-t">
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium text-xs text-gray-500">Input:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">{input}</pre>
            </div>
            <div>
              <p className="font-medium text-xs text-gray-500">Output:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">{output}</pre>
            </div>
            {explanation && (
              <div>
                <p className="font-medium text-xs text-gray-500">Explanation:</p>
                <p className="text-xs text-gray-700 mt-1">{explanation}</p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
