
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  startDate: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),
  timeLimit: z.coerce.number().min(15, "Time limit must be at least 15 minutes").max(180, "Time limit can't exceed 180 minutes"),
  questions: z.array(
    z.object({
      title: z.string().min(5, "Question title is required"),
      description: z.string().min(20, "Question description is required"),
      difficulty: z.enum(['Easy', 'Medium', 'Hard']),
      initialCode: z.object({
        javascript: z.string(),
        python: z.string(),
        java: z.string(),
        cpp: z.string(),
      }),
      examples: z.array(
        z.object({
          input: z.string(),
          output: z.string(),
          explanation: z.string().optional(),
        })
      ).min(1, "At least one example is required"),
      constraints: z.array(z.string()).min(1, "At least one constraint is required"),
      testCases: z.array(
        z.object({
          input: z.string(),
          expected: z.string(),
        })
      ).min(1, "At least one test case is required"),
    })
  ).min(1, "At least one question is required"),
});

type FormData = z.infer<typeof formSchema>;

const ContestCreatePage = () => {
  const { id: classId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [currentTestCaseIndex, setCurrentTestCaseIndex] = useState(0);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: '09:00',
      timeLimit: 60,
      questions: [
        {
          title: '',
          description: '',
          difficulty: 'Medium',
          initialCode: {
            javascript: 'function solution(input) {\n  // Your code here\n  \n  return result;\n}',
            python: 'def solution(input):\n    # Your code here\n    \n    return result',
            java: 'public class Solution {\n  public static String solution(String input) {\n    // Your code here\n    \n    return result;\n  }\n}',
            cpp: '#include <iostream>\n\nstd::string solution(std::string input) {\n  // Your code here\n  \n  return result;\n}',
          },
          examples: [{ input: '', output: '', explanation: '' }],
          constraints: [''],
          testCases: [{ input: '', expected: '' }],
        },
      ],
    },
  });
  
  const { control, watch, setValue } = form;
  
  const questions = watch('questions');
  const currentQuestion = questions[currentQuestionIndex] || { examples: [], constraints: [], testCases: [] };
  
  const handleAddQuestion = () => {
    const newQuestion = {
      title: '',
      description: '',
      difficulty: 'Medium' as const,
      initialCode: {
        javascript: 'function solution(input) {\n  // Your code here\n  \n  return result;\n}',
        python: 'def solution(input):\n    # Your code here\n    \n    return result',
        java: 'public class Solution {\n  public static String solution(String input) {\n    // Your code here\n    \n    return result;\n  }\n}',
        cpp: '#include <iostream>\n\nstd::string solution(std::string input) {\n  // Your code here\n  \n  return result;\n}',
      },
      examples: [{ input: '', output: '', explanation: '' }],
      constraints: [''],
      testCases: [{ input: '', expected: '' }],
    };
    
    setValue('questions', [...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
    setCurrentExampleIndex(0);
    setCurrentTestCaseIndex(0);
  };
  
  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("You must have at least one question");
      return;
    }
    
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setValue('questions', updatedQuestions);
    
    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
    }
  };
  
  const handleAddExample = () => {
    const updatedExamples = [...currentQuestion.examples, { input: '', output: '', explanation: '' }];
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, examples: updatedExamples } : q
    );
    
    setValue('questions', updatedQuestions);
    setCurrentExampleIndex(updatedExamples.length - 1);
  };
  
  const handleRemoveExample = (index: number) => {
    if (currentQuestion.examples.length === 1) {
      toast.error("You must have at least one example");
      return;
    }
    
    const updatedExamples = currentQuestion.examples.filter((_, i) => i !== index);
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, examples: updatedExamples } : q
    );
    
    setValue('questions', updatedQuestions);
    
    if (currentExampleIndex >= updatedExamples.length) {
      setCurrentExampleIndex(Math.max(0, updatedExamples.length - 1));
    }
  };
  
  const handleAddConstraint = () => {
    const updatedConstraints = [...currentQuestion.constraints, ''];
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, constraints: updatedConstraints } : q
    );
    
    setValue('questions', updatedQuestions);
  };
  
  const handleRemoveConstraint = (index: number) => {
    if (currentQuestion.constraints.length === 1) {
      toast.error("You must have at least one constraint");
      return;
    }
    
    const updatedConstraints = currentQuestion.constraints.filter((_, i) => i !== index);
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, constraints: updatedConstraints } : q
    );
    
    setValue('questions', updatedQuestions);
  };
  
  const handleAddTestCase = () => {
    const updatedTestCases = [...currentQuestion.testCases, { input: '', expected: '' }];
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, testCases: updatedTestCases } : q
    );
    
    setValue('questions', updatedQuestions);
    setCurrentTestCaseIndex(updatedTestCases.length - 1);
  };
  
  const handleRemoveTestCase = (index: number) => {
    if (currentQuestion.testCases.length === 1) {
      toast.error("You must have at least one test case");
      return;
    }
    
    const updatedTestCases = currentQuestion.testCases.filter((_, i) => i !== index);
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, testCases: updatedTestCases } : q
    );
    
    setValue('questions', updatedQuestions);
    
    if (currentTestCaseIndex >= updatedTestCases.length) {
      setCurrentTestCaseIndex(Math.max(0, updatedTestCases.length - 1));
    }
  };
  
  const handleUpdateExample = (field: string, value: string) => {
    const updatedExamples = currentQuestion.examples.map((ex, i) => 
      i === currentExampleIndex ? { ...ex, [field]: value } : ex
    );
    
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, examples: updatedExamples } : q
    );
    
    setValue('questions', updatedQuestions);
  };
  
  const handleUpdateConstraint = (index: number, value: string) => {
    const updatedConstraints = [...currentQuestion.constraints];
    updatedConstraints[index] = value;
    
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, constraints: updatedConstraints } : q
    );
    
    setValue('questions', updatedQuestions);
  };
  
  const handleUpdateTestCase = (field: string, value: string) => {
    const updatedTestCases = currentQuestion.testCases.map((tc, i) => 
      i === currentTestCaseIndex ? { ...tc, [field]: value } : tc
    );
    
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, testCases: updatedTestCases } : q
    );
    
    setValue('questions', updatedQuestions);
  };
  
  const handleUpdateInitialCode = (language: string, value: string) => {
    const updatedInitialCode = { ...currentQuestion.initialCode, [language]: value };
    
    const updatedQuestions = questions.map((q, i) => 
      i === currentQuestionIndex ? { ...q, initialCode: updatedInitialCode } : q
    );
    
    setValue('questions', updatedQuestions);
  };
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const startDate = new Date(data.startDate);
      startDate.setHours(hours, minutes);
      
      // Calculate end time based on time limit
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + data.timeLimit);
      
      const contestData = {
        ...data,
        classId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      console.log('Contest data:', contestData);
      
      // In a real application, you would send this to your API
      setTimeout(() => {
        toast.success("Contest created successfully!");
        navigate(`/classes/${classId}`);
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to create contest");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Create a Coding Contest</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Contest Details</CardTitle>
              <CardDescription>
                Set up the basic information for your coding contest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contest Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Python Coding Challenge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what students will need to do in this contest" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (24-hour format)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="14:00"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        min={15}
                        max={180}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <Button type="button" variant="outline" onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            <div className="mb-6 flex flex-wrap gap-2">
              {questions.map((question, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={currentQuestionIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setCurrentExampleIndex(0);
                    setCurrentTestCaseIndex(0);
                  }}
                  className="relative"
                >
                  Question {index + 1}
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveQuestion(index);
                      }}
                    >
                      ×
                    </button>
                  )}
                </Button>
              ))}
            </div>
            
            {questions[currentQuestionIndex] && (
              <Card>
                <CardHeader>
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                  <CardDescription>Define the question details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Two Sum" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the problem statement in detail..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name={`questions.${currentQuestionIndex}.difficulty`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <FormLabel>Examples</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddExample}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Example
                      </Button>
                    </div>
                    
                    <div className="mb-4 flex flex-wrap gap-2">
                      {currentQuestion.examples.map((_, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={currentExampleIndex === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentExampleIndex(index)}
                          className="relative"
                        >
                          Example {index + 1}
                          {currentQuestion.examples.length > 1 && (
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveExample(index);
                              }}
                            >
                              ×
                            </button>
                          )}
                        </Button>
                      ))}
                    </div>
                    
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <FormLabel>Input</FormLabel>
                          <Input 
                            value={currentQuestion.examples[currentExampleIndex]?.input || ''}
                            onChange={(e) => handleUpdateExample('input', e.target.value)}
                            placeholder="Example input"
                          />
                        </div>
                        
                        <div>
                          <FormLabel>Output</FormLabel>
                          <Input 
                            value={currentQuestion.examples[currentExampleIndex]?.output || ''}
                            onChange={(e) => handleUpdateExample('output', e.target.value)}
                            placeholder="Example output"
                          />
                        </div>
                        
                        <div>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <Textarea 
                            value={currentQuestion.examples[currentExampleIndex]?.explanation || ''}
                            onChange={(e) => handleUpdateExample('explanation', e.target.value)}
                            placeholder="Explain why this is the correct output"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <FormLabel>Constraints</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddConstraint}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Constraint
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {currentQuestion.constraints.map((constraint, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            value={constraint}
                            onChange={(e) => handleUpdateConstraint(index, e.target.value)}
                            placeholder="e.g., 1 <= nums.length <= 10^4"
                          />
                          
                          {currentQuestion.constraints.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveConstraint(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <FormLabel>Test Cases</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddTestCase}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Test Case
                      </Button>
                    </div>
                    
                    <div className="mb-4 flex flex-wrap gap-2">
                      {currentQuestion.testCases.map((_, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={currentTestCaseIndex === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentTestCaseIndex(index)}
                          className="relative"
                        >
                          Test Case {index + 1}
                          {currentQuestion.testCases.length > 1 && (
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTestCase(index);
                              }}
                            >
                              ×
                            </button>
                          )}
                        </Button>
                      ))}
                    </div>
                    
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <FormLabel>Input</FormLabel>
                          <Input 
                            value={currentQuestion.testCases[currentTestCaseIndex]?.input || ''}
                            onChange={(e) => handleUpdateTestCase('input', e.target.value)}
                            placeholder="Test input data"
                          />
                        </div>
                        
                        <div>
                          <FormLabel>Expected Output</FormLabel>
                          <Input 
                            value={currentQuestion.testCases[currentTestCaseIndex]?.expected || ''}
                            onChange={(e) => handleUpdateTestCase('expected', e.target.value)}
                            placeholder="Expected output"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <FormLabel>Starter Code</FormLabel>
                    <div className="space-y-4 mt-2">
                      <div>
                        <p className="text-sm font-medium mb-2">JavaScript</p>
                        <Textarea 
                          value={currentQuestion.initialCode.javascript}
                          onChange={(e) => handleUpdateInitialCode('javascript', e.target.value)}
                          className="font-mono text-sm h-32"
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Python</p>
                        <Textarea 
                          value={currentQuestion.initialCode.python}
                          onChange={(e) => handleUpdateInitialCode('python', e.target.value)}
                          className="font-mono text-sm h-32"
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Java</p>
                        <Textarea 
                          value={currentQuestion.initialCode.java}
                          onChange={(e) => handleUpdateInitialCode('java', e.target.value)}
                          className="font-mono text-sm h-32"
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">C++</p>
                        <Textarea 
                          value={currentQuestion.initialCode.cpp}
                          onChange={(e) => handleUpdateInitialCode('cpp', e.target.value)}
                          className="font-mono text-sm h-32"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate(`/classes/${classId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Contest'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContestCreatePage;
