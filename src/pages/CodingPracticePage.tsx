
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { CodeEditor } from '@/components/CodeEditor';
import { CodeRunner } from '@/components/CodeRunner';
import { TestCase } from '@/components/TestCase';
import { ChevronLeft, ChevronRight, Play, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: string;
  language: string;
  testCases: {
    input: string;
    expectedOutput: string;
    explanation?: string;
  }[];
  constraints: string[];
  hints: string[];
}

const sampleChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    starterCode: 'function twoSum(nums, target) {\n  // Write your code here\n\n  return [];\n}',
    language: 'javascript',
    testCases: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        expectedOutput: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        expectedOutput: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        expectedOutput: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      'Try using a hash map to store the values you\'ve seen so far.',
      'For each element, check if its complement (target - current) exists in the map.'
    ]
  },
  {
    id: '2',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    starterCode: 'function reverseString(s) {\n  // Write your code here\n\n  return s;\n}',
    language: 'javascript',
    testCases: [
      {
        input: 's = ["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]',
        explanation: 'After reversing, the array becomes ["o","l","l","e","h"].'
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]',
        explanation: 'After reversing, the array becomes ["h","a","n","n","a","H"].'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.',
      'You need to do this in-place, without allocating extra space.'
    ],
    hints: [
      'Use two pointers approach, one at the start and one at the end.',
      'Swap characters while moving pointers towards the center.'
    ]
  },
  {
    id: '3',
    title: 'Fizz Buzz',
    difficulty: 'Easy',
    description: 'Given an integer n, return a string array answer (1-indexed) where:\n\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.',
    starterCode: 'function fizzBuzz(n) {\n  // Write your code here\n\n  return [];\n}',
    language: 'javascript',
    testCases: [
      {
        input: 'n = 3',
        expectedOutput: '["1","2","Fizz"]',
        explanation: ''
      },
      {
        input: 'n = 5',
        expectedOutput: '["1","2","Fizz","4","Buzz"]',
        explanation: ''
      },
      {
        input: 'n = 15',
        expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
        explanation: ''
      }
    ],
    constraints: [
      '1 <= n <= 10^4'
    ],
    hints: [
      'Use the modulo operator (%) to check for divisibility.',
      'Check for divisibility by both 3 and 5 first, then check for 3 and 5 separately.'
    ]
  }
];

const CodingPracticePage: React.FC = () => {
  const [challenges] = useState<Challenge[]>(sampleChallenges);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [runningTests, setRunningTests] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Array<{passed: boolean, output: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (challenges.length > 0) {
      setCurrentChallenge(challenges[0]);
      setCurrentCode(challenges[0].starterCode);
    }
  }, [challenges]);

  const handleRunCode = () => {
    try {
      // Create a sandbox environment to run the code
      const sandbox = new Function('return ' + currentCode)();
      
      // For simplicity, we'll just run the function with basic input
      const sampleInput = currentChallenge?.testCases[0].input || '';
      
      // Extract variables from input string (simple parsing)
      const inputMatch = sampleInput.match(/(\w+)\s*=\s*(\[.+?\]|\d+|".+?")/g);
      const inputVars: {[key: string]: any} = {};
      
      if (inputMatch) {
        inputMatch.forEach(match => {
          const [key, value] = match.split('=').map(s => s.trim());
          try {
            inputVars[key] = JSON.parse(value);
          } catch {
            inputVars[key] = value;
          }
        });
      }
      
      // Call the function with extracted variables
      let result;
      if (currentChallenge?.title === "Two Sum") {
        result = sandbox(inputVars.nums, inputVars.target);
      } else if (currentChallenge?.title === "Reverse String") {
        result = sandbox([...inputVars.s]); // Clone the array
      } else if (currentChallenge?.title === "Fizz Buzz") {
        result = sandbox(inputVars.n);
      }
      
      setOutput(JSON.stringify(result, null, 2));
      toast({
        title: "Code executed successfully",
        description: "Check the output panel for results",
      });
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast({
        title: "Execution error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRunTests = () => {
    setRunningTests(true);
    setTestResults([]);
    
    try {
      const sandbox = new Function('return ' + currentCode)();
      const results = currentChallenge?.testCases.map(testCase => {
        try {
          // Extract variables from input string
          const inputMatch = testCase.input.match(/(\w+)\s*=\s*(\[.+?\]|\d+|".+?")/g);
          const inputVars: {[key: string]: any} = {};
          
          if (inputMatch) {
            inputMatch.forEach(match => {
              const [key, value] = match.split('=').map(s => s.trim());
              try {
                inputVars[key] = JSON.parse(value);
              } catch {
                inputVars[key] = value;
              }
            });
          }
          
          // Call the function with extracted variables
          let result;
          if (currentChallenge?.title === "Two Sum") {
            result = sandbox(inputVars.nums, inputVars.target);
          } else if (currentChallenge?.title === "Reverse String") {
            const arrCopy = [...inputVars.s]; // Clone the array
            result = sandbox(arrCopy);
            // If function returns undefined, use the modified array
            if (result === undefined) result = arrCopy;
          } else if (currentChallenge?.title === "Fizz Buzz") {
            result = sandbox(inputVars.n);
          }
          
          // Parse the expected output
          let expectedOutput;
          try {
            expectedOutput = JSON.parse(testCase.expectedOutput);
          } catch {
            expectedOutput = testCase.expectedOutput;
          }
          
          // Compare result with expected output
          const resultStr = JSON.stringify(result);
          const expectedStr = JSON.stringify(expectedOutput);
          const passed = resultStr === expectedStr;
          
          return {
            passed,
            output: resultStr
          };
        } catch (error) {
          return {
            passed: false,
            output: `Error: ${error.message}`
          };
        }
      }) || [];
      
      setTestResults(results);
      
      const allPassed = results.every(result => result.passed);
      toast({
        title: allPassed ? "All tests passed! 🎉" : "Some tests failed",
        description: allPassed 
          ? "Your solution works for all test cases!" 
          : "Check the test results for more details",
        variant: allPassed ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Execution error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRunningTests(false);
    }
  };

  const handleChallengeSelect = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setCurrentChallenge(challenge);
      setCurrentCode(challenge.starterCode);
      setOutput('');
      setTestResults([]);
    }
  };

  const navigateChallenge = (direction: 'prev' | 'next') => {
    if (!currentChallenge) return;
    
    const currentIndex = challenges.findIndex(c => c.id === currentChallenge.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Wrap around if needed
    if (newIndex < 0) newIndex = challenges.length - 1;
    if (newIndex >= challenges.length) newIndex = 0;
    
    handleChallengeSelect(challenges[newIndex].id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return '';
    }
  };

  if (!currentChallenge) {
    return <div className="container mx-auto p-6">Loading challenges...</div>;
  }

  return (
    <div className="container mx-auto p-4 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Coding Practice</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateChallenge('prev')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateChallenge('next')}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentChallenge.title}</span>
                <span className={`text-sm font-normal ${getDifficultyColor(currentChallenge.difficulty)}`}>
                  {currentChallenge.difficulty}
                </span>
              </CardTitle>
              <CardDescription>
                Problem #{currentChallenge.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="description">
                <TabsList className="w-full">
                  <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                  <TabsTrigger value="hints" className="flex-1">Hints</TabsTrigger>
                  <TabsTrigger value="constraints" className="flex-1">Constraints</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{currentChallenge.description}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-lg mb-2">Examples</h4>
                    {currentChallenge.testCases.map((testCase, index) => (
                      <TestCase 
                        key={index}
                        index={index + 1}
                        input={testCase.input}
                        output={testCase.expectedOutput}
                        explanation={testCase.explanation}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="hints" className="mt-4">
                  <div className="space-y-2">
                    {currentChallenge.hints.map((hint, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                        <p className="text-sm"><strong>Hint {index + 1}:</strong> {hint}</p>
                      </div>
                    ))}
                    {currentChallenge.hints.length === 0 && (
                      <p className="text-gray-500 italic">No hints available for this problem.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="constraints" className="mt-4">
                  <ul className="list-disc pl-5 space-y-1">
                    {currentChallenge.constraints.map((constraint, index) => (
                      <li key={index} className="text-sm text-gray-700">{constraint}</li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Solution</CardTitle>
              <CardDescription>
                {currentChallenge.language === 'javascript' ? 'JavaScript' : currentChallenge.language}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor 
                code={currentCode} 
                language={currentChallenge.language}
                onChange={setCurrentCode} 
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleRunCode}
                className="gap-1"
              >
                <Play className="h-4 w-4" /> Run Code
              </Button>
              <Button 
                onClick={handleRunTests}
                disabled={runningTests}
                className="gap-1"
              >
                {runningTests ? (
                  <>Running Tests...</>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Submit
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Output</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeRunner output={output} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Test Case #{index + 1}</span>
                          {result.passed ? (
                            <span className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" /> Passed
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <X className="h-4 w-4 mr-1" /> Failed
                            </span>
                          )}
                        </div>
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Input: </span>
                            <span className="text-gray-600">{currentChallenge.testCases[index].input}</span>
                          </div>
                          <div>
                            <span className="font-medium">Expected: </span>
                            <span className="text-gray-600">{currentChallenge.testCases[index].expectedOutput}</span>
                          </div>
                          <div>
                            <span className="font-medium">Your output: </span>
                            <span className={result.passed ? "text-green-600" : "text-red-600"}>
                              {result.output}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Run the tests to see results</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPracticePage;
