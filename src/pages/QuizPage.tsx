
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Timer,
  CheckSquare,
  Square,
  MinusCircle,
  HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getQuizByTopic, type QuizQuestion, type QuizData } from '@/data/sampleQuizData';

interface QuizConfig {
  quizType: 'mcq' | 'true-false' | 'multiple-correct';
  timeMode: 'timed' | 'practice';
  duration: number; // in minutes
  questionCount: number;
  timerPerQuestion: boolean;
  negativeMarking: boolean;
}

const QuizPage: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const defaultConfig: QuizConfig = {
    quizType: 'mcq',
    timeMode: 'timed',
    duration: 10,
    questionCount: 10,
    timerPerQuestion: false,
    negativeMarking: false
  };
  
  const quizConfig: QuizConfig = location.state?.quizConfig || defaultConfig;
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizEnded, setQuizEnded] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(quizConfig.duration * 60); // in seconds
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [questionResults, setQuestionResults] = useState<Record<number, {
    attempted: boolean;
    isCorrect: boolean;
    partiallyCorrect?: boolean;
    score: number;
  }>>({});
  
  const timePerQuestion = quizConfig.timerPerQuestion 
    ? Math.floor((quizConfig.duration * 60) / quizConfig.questionCount) 
    : 0;
  
  useEffect(() => {
      if (topic) {
        getQuizByTopic(topic, quizConfig.quizType, quizConfig.questionCount).then(quiz => {
          setQuizData({
            ...quiz,
          });
          
          // Initialize empty answer slots for each question
          const initialAnswers: Record<string, number[]> = {};
          quiz.questions.forEach((q, index) => {
            initialAnswers[index] = [];
          });
          setSelectedAnswers(initialAnswers);
          
        }).catch(error => {
          console.error("Failed to fetch quiz data:", error);
        });
      }
    }, [topic, quizConfig]);
  
  useEffect(() => {
    if (quizStarted && quizConfig.timerPerQuestion && !quizEnded) {
      setQuestionTimeRemaining(timePerQuestion);
    }
  }, [quizStarted, activeQuestionIndex, quizConfig.timerPerQuestion, timePerQuestion, quizEnded]);
  
  useEffect(() => {
    if (!quizStarted || quizEnded || quizConfig.timeMode === 'practice') return;
    
    const timerId = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          endQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [quizStarted, quizEnded, quizConfig.timeMode]);
  
  useEffect(() => {
    if (!quizStarted || quizEnded || !quizConfig.timerPerQuestion) return;
    
    const questionTimerId = setInterval(() => {
      setQuestionTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(questionTimerId);
          goToNextQuestion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(questionTimerId);
  }, [quizStarted, quizEnded, quizConfig.timerPerQuestion, questionTimeRemaining]);
  
  const startQuiz = () => {
    setQuizStarted(true);
    if (quizConfig.timeMode === 'timed') {
      setTimeRemaining(quizConfig.duration * 60);
    }
    if (quizConfig.timerPerQuestion) {
      setQuestionTimeRemaining(timePerQuestion);
    }
  };
  
  const calculateQuestionScore = (question: QuizQuestion, userAnswers: number[]): { score: number, isCorrect: boolean, partiallyCorrect?: boolean } => {
    if (userAnswers.length === 0) {
      // Skipped question
      return { score: 0, isCorrect: false };
    }
    
    if (question.type === 'mcq' || question.type === 'true-false') {
      const isCorrect = userAnswers.length === 1 && userAnswers[0] === question.correctAnswers[0];
      
      if (isCorrect) {
        return { score: 4, isCorrect: true };
      } else if (quizConfig.negativeMarking) {
        return { score: -1, isCorrect: false };
      } else {
        return { score: 0, isCorrect: false };
      }
    } else if (question.type === 'multiple-correct') {
      // For multiple-correct questions
      const correctAnswersSelected = userAnswers.filter(answer => 
        question.correctAnswers.includes(answer)
      ).length;
      
      const incorrectAnswersSelected = userAnswers.filter(answer => 
        !question.correctAnswers.includes(answer)
      ).length;
      
      // All correct answers selected and no incorrect ones
      const allCorrect = correctAnswersSelected === question.correctAnswers.length && incorrectAnswersSelected === 0;
      
      // Some correct answers but not all, and no incorrect ones
      const partiallyCorrect = correctAnswersSelected > 0 && correctAnswersSelected < question.correctAnswers.length && incorrectAnswersSelected === 0;
      
      // Any incorrect answers selected
      const anyIncorrect = incorrectAnswersSelected > 0;
      
      if (allCorrect) {
        return { score: 4, isCorrect: true };
      } else if (partiallyCorrect) {
        return { 
          score: correctAnswersSelected, 
          isCorrect: false,
          partiallyCorrect: true
        };
      } else if (anyIncorrect && quizConfig.negativeMarking) {
        return { score: -2, isCorrect: false };
      } else {
        return { score: 0, isCorrect: false };
      }
    }
    
    return { score: 0, isCorrect: false };
  };
  
  const endQuiz = useCallback(() => {
    setQuizEnded(true);
    
    if (!quizData) return;
    
    let totalScore = 0;
    const results: Record<number, {
      attempted: boolean;
      isCorrect: boolean;
      partiallyCorrect?: boolean;
      score: number;
    }> = {};
    
    quizData.questions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      const attempted = userAnswers.length > 0;
      const result = calculateQuestionScore(question, userAnswers);
      
      results[index] = {
        attempted,
        isCorrect: result.isCorrect,
        partiallyCorrect: result.partiallyCorrect,
        score: result.score
      };
      
      totalScore += result.score;
    });
    
    // Ensure totalScore is not negative
    totalScore = Math.max(0, totalScore);
    
    // Calculate percentage (max possible score is 4 points per question)
    const maxPossibleScore = quizData.questions.length * 4;
    const scorePercentage = Math.round((totalScore / maxPossibleScore) * 100);
    
    setScore(scorePercentage);
    setQuestionResults(results);
    
    toast.success(`Quiz completed! Your score: ${scorePercentage}%`);
  }, [quizData, selectedAnswers, quizConfig.negativeMarking]);
  
  const handleAnswerSelect = (questionIndex: number, optionIndex: number, multiple: boolean = false) => {
    setSelectedAnswers(prev => {
      const current = prev[questionIndex] || [];
      let newAnswers;
      
      if (multiple) {
        // For multiple-correct questions
        if (current.includes(optionIndex)) {
          newAnswers = current.filter(idx => idx !== optionIndex);
        } else {
          newAnswers = [...current, optionIndex];
        }
      } else {
        // For single-answer questions
        newAnswers = [optionIndex];
      }
      
      // Create a new object to ensure state updates
      return { ...prev, [questionIndex]: newAnswers };
    });
  };
  
  const clearAnswers = (questionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: []
    }));
    toast.info("Selection cleared");
  };
  
  const goToNextQuestion = useCallback(() => {
    if (!quizData) return;
    
    if (activeQuestionIndex < quizData.questions.length - 1) {
      setActiveQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      endQuiz();
    }
  }, [activeQuestionIndex, quizData, endQuiz]);
  
  const goToPreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prevIndex => prevIndex - 1);
    }
  };
  
  const handleSubmitQuiz = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      endQuiz();
      setIsSubmitting(false);
    }, 1000);
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const calculateProgress = (): number => {
    if (!quizData || quizData.questions.length === 0) return 0;
    return ((activeQuestionIndex + 1) / quizData.questions.length) * 100;
  };
  
  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading quiz...</span>
      </div>
    );
  }
  
  const currentQuestion = quizData.questions[activeQuestionIndex];
  const isMultipleCorrect = currentQuestion.type === 'multiple-correct';
  const userAnswers = selectedAnswers[activeQuestionIndex] || [];
  
  if (!quizStarted) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{quizData.topic} Quiz</CardTitle>
            <CardDescription>
              {quizConfig.quizType === 'mcq' ? 'Multiple Choice Questions' : 
                quizConfig.quizType === 'true-false' ? 'True/False Questions' : 
                'Multiple Correct Answers Questions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="space-y-4 w-full">
              <p className="text-center">You will have {quizConfig.timeMode === 'practice' ? 'unlimited time' : `${quizConfig.duration} minutes`} to complete {quizData.questions.length} questions.</p>
              
              {quizConfig.timerPerQuestion && (
                <p className="text-center">Each question has a time limit of {formatTime(timePerQuestion)} seconds.</p>
              )}
              
              {quizConfig.negativeMarking && (
                <div className="flex items-center justify-center gap-2 text-center text-rose-600 font-medium mb-2">
                  <MinusCircle className="h-4 w-4" />
                  <span>Negative marking is enabled</span>
                </div>
              )}
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                <div className="flex flex-col items-center">
                  <h4 className="font-semibold text-center">Quiz Instructions</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-center">
                    <li>Read each question carefully before answering.</li>
                    <li>{isMultipleCorrect ? 'Some questions may have multiple correct answers.' : 'Each question has exactly one correct answer.'}</li>
                    <li>You can clear your selection for any question.</li>
                    <li>You can navigate between questions using the next and previous buttons.</li>
                    {quizConfig.timeMode === 'timed' && <li>The quiz will automatically end when the time is up.</li>}
                    
                    {quizConfig.negativeMarking && (
                      <>
                        <li className="font-medium text-rose-700">Negative marking is enabled:</li>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          <li>MCQ/True-False: +4 points for correct, -1 for incorrect</li>
                          <li>Multiple-correct: +1 per correct choice, +4 for all correct, -2 if any wrong option selected</li>
                        </ul>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startQuiz} className="w-full">Start Quiz</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (quizEnded) {
    return <QuizResults 
      quizData={quizData}
      selectedAnswers={selectedAnswers}
      score={score}
      onReturnToTopic={() => navigate(`/topic/${topic}`)}
      questionResults={questionResults}
      negativeMarking={quizConfig.negativeMarking}
    />;
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{quizData.topic} Quiz</CardTitle>
            {quizConfig.timeMode === 'timed' && (
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <div className="w-full">
            <div className="flex justify-between text-sm mb-1">
              <span>Question {activeQuestionIndex + 1} of {quizData.questions.length}</span>
              {quizConfig.timerPerQuestion && (
                <div className="flex items-center gap-1 text-rose-600">
                  <Timer className="h-4 w-4" />
                  <span>{formatTime(questionTimeRemaining)}</span>
                </div>
              )}
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{currentQuestion.question}</div>
          
          {isMultipleCorrect ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`option-${idx}`}
                    checked={userAnswers.includes(idx)}
                    onCheckedChange={() => handleAnswerSelect(activeQuestionIndex, idx, true)}
                  />
                  <Label 
                    htmlFor={`option-${idx}`}
                    className="cursor-pointer flex-1 p-3 rounded-md hover:bg-accent"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup 
              value={userAnswers.length ? userAnswers[0].toString() : undefined}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={idx.toString()} 
                    id={`option-${idx}`} 
                    checked={userAnswers.includes(idx)}
                    onClick={() => handleAnswerSelect(activeQuestionIndex, idx)}
                  />
                  <Label 
                    htmlFor={`option-${idx}`}
                    className="cursor-pointer flex-1 p-3 rounded-md hover:bg-accent"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => clearAnswers(activeQuestionIndex)}
              disabled={userAnswers.length === 0}
            >
              <X className="mr-1 h-3 w-3" /> Clear Selection
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={activeQuestionIndex === 0}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
          </div>
          <div className="flex gap-2">
            {activeQuestionIndex === quizData.questions.length - 1 && (
              <Button 
                onClick={handleSubmitQuiz} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Finish Quiz
                  </>
                )}
              </Button>
            )}
            
            {activeQuestionIndex < quizData.questions.length - 1 && (
              <Button onClick={goToNextQuestion}>
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

interface QuizResultsProps {
  quizData: QuizData;
  selectedAnswers: Record<string, number[]>;
  score: number;
  onReturnToTopic: () => void;
  questionResults: Record<number, {
    attempted: boolean;
    isCorrect: boolean;
    partiallyCorrect?: boolean;
    score: number;
  }>;
  negativeMarking: boolean;
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
  quizData, 
  selectedAnswers, 
  score,
  onReturnToTopic,
  questionResults,
  negativeMarking
}) => {
  const [showExplanations, setShowExplanations] = useState<boolean>(true);
  
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
          <CardDescription>
            You've completed the {quizData.topic} quiz
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
            <div className="text-4xl font-bold mb-2 text-center">
              <span className={getScoreColor(score)}>{score}%</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {score >= 80 ? 'Excellent work!' : 
              score >= 60 ? 'Good job!' : 
              'Keep practicing!'}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Review Questions</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
            >
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </Button>
          </div>
          
          <div className="space-y-8">
            {quizData.questions.map((question, idx) => {
              const userAnswers = selectedAnswers[idx] || [];
              const result = questionResults[idx] || { attempted: false, isCorrect: false, score: 0 };
              const isSkipped = !result.attempted;
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border ${result.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : result.partiallyCorrect 
                      ? 'border-amber-200 bg-amber-50'
                      : isSkipped
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-red-200 bg-red-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Question {idx + 1}</h4>
                    {result.isCorrect ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <Check className="h-4 w-4 mr-1" /> Correct (+{result.score})
                      </span>
                    ) : isSkipped ? (
                      <span className="flex items-center text-slate-600 text-sm font-medium">
                        <HelpCircle className="h-4 w-4 mr-1" /> Not Attempted
                      </span>
                    ) : result.partiallyCorrect ? (
                      <span className="flex items-center text-amber-600 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 mr-1" /> Partially Correct (+{result.score})
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm font-medium">
                        <X className="h-4 w-4 mr-1" /> 
                        Incorrect {result.score < 0 ? `(${result.score})` : ''}
                      </span>
                    )}
                  </div>
                  
                  <p className="mt-2">{question.question}</p>
                  
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, optIdx) => {
                      const isUserSelected = userAnswers.includes(optIdx);
                      const isCorrectOption = question.correctAnswers.includes(optIdx);
                      
                      let className = "pl-2 py-1 border-l-2 ";
                      
                      if (isUserSelected && isCorrectOption) {
                        className += "border-green-500 bg-green-100";
                      } else if (isUserSelected && !isCorrectOption) {
                        className += "border-red-500 bg-red-100";
                      } else if (!isUserSelected && isCorrectOption) {
                        className += "border-amber-500 bg-amber-100";
                      } else {
                        className += "border-transparent";
                      }
                      
                      return (
                        <div key={`${idx}-option-${optIdx}`} className={className}>
                          <div className="flex items-start gap-2">
                            {question.type === 'multiple-correct' ? (
                              isCorrectOption ? (
                                <CheckSquare className="h-4 w-4 text-green-600 mt-0.5" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400 mt-0.5" />
                              )
                            ) : (
                              <div className="relative flex h-4 w-4 items-center justify-center">
                                <div className={`h-3 w-3 rounded-full ${isCorrectOption ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                              </div>
                            )}
                            <span>{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {showExplanations && question.explanation && (
                    <div className="mt-4 text-sm bg-white p-3 rounded border border-slate-200">
                      <span className="font-medium">Explanation:</span> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={onReturnToTopic} className="w-full">
            Return to Topic
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizPage;
