
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  CircleOff, 
  ListChecks, 
  BookOpen 
} from "lucide-react";

interface QuizTypeSelectorProps {
  onClose: () => void;
}

type QuizType = 'mcq' | 'true-false' | 'multiple-correct';

const QuizTypeSelector: React.FC<QuizTypeSelectorProps> = ({ onClose }) => {
  const [selectedType, setSelectedType] = React.useState<QuizType>('mcq');

  const handleGenerateQuiz = () => {
    toast.success(`Generating ${getQuizTypeName(selectedType)} quiz`);
    // Here you would implement the logic to navigate to the quiz page or generate the quiz
    // For now we'll just show a toast message
    onClose();
  };

  const getQuizTypeName = (type: QuizType): string => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice';
      case 'true-false':
        return 'True/False';
      case 'multiple-correct':
        return 'Multiple Correct Answers';
      default:
        return '';
    }
  };

  return (
    <div className="py-4">
      <RadioGroup
        value={selectedType}
        onValueChange={(value) => setSelectedType(value as QuizType)}
        className="space-y-4"
      >
        <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
          <RadioGroupItem value="mcq" id="mcq" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center">
              <Label htmlFor="mcq" className="font-medium text-base cursor-pointer">Multiple Choice Questions</Label>
              <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Questions with 4 options where only one answer is correct
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
          <RadioGroupItem value="true-false" id="true-false" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center">
              <Label htmlFor="true-false" className="font-medium text-base cursor-pointer">True/False Questions</Label>
              <CircleOff className="ml-2 h-4 w-4 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Questions where the answer is either true or false
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
          <RadioGroupItem value="multiple-correct" id="multiple-correct" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center">
              <Label htmlFor="multiple-correct" className="font-medium text-base cursor-pointer">Multiple Correct Answers</Label>
              <ListChecks className="ml-2 h-4 w-4 text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Questions with 4 options where any number of answers can be correct
            </p>
          </div>
        </div>
      </RadioGroup>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleGenerateQuiz}>
          Generate Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizTypeSelector;
