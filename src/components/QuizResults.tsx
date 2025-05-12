import { QuizData } from '@/data/getQuizData';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { generateQuizAnswerKey, generateQuizQuestionsOnly, generateQuizWithAttempts } from '@/downloadQuizUtils';
import { uploadPdfFile, uploadTextFile } from '@/downloadQuizUtils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { FileText, FileSignature, FileDown, ChevronRight } from 'lucide-react';
import { Check, CheckSquare, Square, HelpCircle, AlertCircle, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

interface QuizResultsProps {
    topic: string;
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
    quiz_attempt_id: number;
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
    quizData, 
    selectedAnswers, 
    topic,
    score,
    onReturnToTopic,
    questionResults,
    negativeMarking,
    quiz_attempt_id
}) => {
    const [reportLoading, setReportLoading] = useState(false);
    const [filesUploaded, setFilesUploaded] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    // Auto-upload all quiz files after quiz_attempt_id is available and files not yet uploaded
    useEffect(() => {
      if (!quiz_attempt_id || filesUploaded || !quizData) return;
      (async () => {
        try {
          Promise.all([
            handleUploadQuiz('questionsOnly', 'txt', quiz_attempt_id),
            handleUploadQuiz('questionsOnly', 'pdf', quiz_attempt_id),
            handleUploadQuiz('withAttempts', 'txt', quiz_attempt_id),
            handleUploadQuiz('withAttempts', 'pdf', quiz_attempt_id),
            handleUploadQuiz('answerKey', 'txt', quiz_attempt_id),
            handleUploadQuiz('answerKey', 'pdf', quiz_attempt_id),
            handleUploadReportCard(quiz_attempt_id)
          ]).then(() => {
            setFilesUploaded(true);
          })
          .catch(err => {
            console.error('Error uploading files:', err);
          });
        } catch (err) {
          // Optionally handle upload errors
        }
      })();
    }, [quiz_attempt_id, filesUploaded, quizData, negativeMarking, selectedAnswers]);

    // Download Report Card as PDF (UI snapshot)
    const handleUploadReportCard = async (quiz_attempt_id?: number) => {
      if (!resultRef.current) return;
      setReportLoading(true);
      // Save previous styles
      const prevStyle = {
        overflow: resultRef.current.style.overflow,
        height: resultRef.current.style.height,
        maxHeight: resultRef.current.style.maxHeight,
      };
      // Remove constraints for full-content screenshot
      resultRef.current.style.overflow = 'visible';
      resultRef.current.style.height = 'auto';
      resultRef.current.style.maxHeight = 'none';
      // Also patch all children with overflow/height set (optional but recommended)
      const scrollables = resultRef.current.querySelectorAll('[style*="overflow"], [class*="overflow"]');
      const prevChildStyles: {el: HTMLElement, style: {overflow: string, height: string, maxHeight: string}}[] = [];
      scrollables.forEach((el: any) => {
        prevChildStyles.push({
          el,
          style: {
            overflow: el.style.overflow,
            height: el.style.height,
            maxHeight: el.style.maxHeight
          }
        });
        el.style.overflow = 'visible';
        el.style.height = 'auto';
        el.style.maxHeight = 'none';
      });
      try {
        const canvas = await html2canvas(resultRef.current, { scale: 1.2, useCORS: true });
        const jsPDF = (await import('jspdf')).jsPDF;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 40;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let position = 20;
        let remainingHeight = imgHeight;
        let pageImgY = 0;
        const pageImgHeight = pageHeight - 40;
        while (remainingHeight > 0) {
          let sX = 0;
          let sY = pageImgY;
          let sWidth = canvas.width;
          let isLastPage = remainingHeight <= pageImgHeight;
          let sHeight = isLastPage
            ? (canvas.height - sY)
            : Math.min(canvas.height - sY, (pageImgHeight * canvas.width / imgWidth));
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sHeight;
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, sX, sY, sWidth, sHeight, 0, 0, sWidth, sHeight);
          }
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.8);
          if (isLastPage) {
            const lastPageImgHeight = (sHeight * imgWidth) / canvas.width;
            pdf.addImage(pageImgData, 'PNG', 20, 20, imgWidth, lastPageImgHeight);
          } else {
            pdf.addImage(pageImgData, 'PNG', 20, 20, imgWidth, pageImgHeight);
          }
          remainingHeight -= pageImgHeight;
          pageImgY += sHeight;
          if (!isLastPage && remainingHeight > 0) pdf.addPage();
        }
        // Upload as blob
        const pdfBlob = pdf.output('blob');
        const formData = new FormData();
        formData.append('file', pdfBlob, `${quizData.topic || 'quiz'}_report_card.pdf`);
        formData.append('quiz_attempt_id', `${quiz_attempt_id}`);
        await fetch(API_URL + '/quiz-downloads/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
      } catch (e) {
        console.log(e);
      }
      // Restore previous styles
      resultRef.current.style.overflow = prevStyle.overflow;
      resultRef.current.style.height = prevStyle.height;
      resultRef.current.style.maxHeight = prevStyle.maxHeight;
      prevChildStyles.forEach(({el, style}) => {
        el.style.overflow = style.overflow;
        el.style.height = style.height;
        el.style.maxHeight = style.maxHeight;
      });
      setReportLoading(false);
    };




  // Download handler for quiz export options
    const handleUploadQuiz = async (
      mode: 'questionsOnly' | 'withAttempts' | 'answerKey',
      filetype: 'txt' | 'pdf' = 'txt',
      quiz_attempt_id?: number
    ) => {
      if (!quizData) return;
      // Construct a full Quiz object for export
      const now = new Date();
      const quizToExport = {
        id: `${quiz_attempt_id}`, // fallback since QuizData has no id
        topic: quizData.topic,
        subtopic: '', // fallback since QuizData has no subtopic
        date: now.toISOString(),
        percentage: 0,
        total_possible_score: quizData.questions.length * 4,
        score: 0,
        timeSpent: 0,
        negativeMarking: typeof negativeMarking === 'boolean' ? negativeMarking : false,
        question_type: quizData.questions[0]?.type || 'mcq',
        questions: quizData.questions.map((q, idx) => ({
          ...q,
          correctAnswers: q.correct_answers || [],
          selectedAnswers: selectedAnswers[idx] || [],
          isCorrect: false,
          partiallyCorrect: false,
          score: 0,
          explanation: q.explanation || '',
          timeTaken: 0,
        }))
      };

      let content = '';
      let filename = '';
      // Optionally, calculate score and percentage for the exported quiz
      quizToExport.score = quizToExport.questions.reduce((acc, q) => acc + (q.score || 0), 0);
      quizToExport.percentage = quizToExport.total_possible_score > 0 ? Math.round((quizToExport.score / quizToExport.total_possible_score) * 100) : 0;

      switch (mode) {
        case 'questionsOnly':
          content = generateQuizQuestionsOnly(quizToExport);
          filename = `${quizData.topic || 'quiz'}_questions.txt`;
          break;
        case 'withAttempts':
          content = generateQuizWithAttempts(quizToExport);
          filename = `${quizData.topic || 'quiz'}_attempts_and_answers.txt`;
          break;
        case 'answerKey':
          content = generateQuizAnswerKey(quizToExport);
          filename = `${quizData.topic || 'quiz'}_answer_key.txt`;
          break;
        default:
          return;
      }
      if (filetype === 'pdf') {
        await uploadPdfFile(filename.replace(/\.txt$/, '.pdf'), content, quiz_attempt_id);
      } else {
        await uploadTextFile(filename, content, quiz_attempt_id);
      }
    };
    const [showExplanations, setShowExplanations] = useState<boolean>(true);

    const totalPoints = Object.values(questionResults).reduce((sum, result) => sum + result.score, 0);
    const maxPossiblePoints = quizData.questions.length * 4;
    const scorePercentage = Math.round((totalPoints / maxPossiblePoints) * 100);

    const navigate = useNavigate();

    const getScoreColor = (percentage: number): string => {
      if (percentage >= 80) return 'text-green-600';
      if (percentage >= 60) return 'text-amber-600';
      return 'text-red-600';
    };

    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="w-full mb-4">
          <Button 
            variant="default" 
            onClick={onReturnToTopic}
            className="w-full"
          >
            Return to Topic
          </Button>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Quiz Results</CardTitle>
            <CardDescription>
              You've completed the {quizData.topic} quiz
            </CardDescription>
          </CardHeader>
          <CardContent ref={resultRef} className="space-y-6">
            {/* Download buttons for quiz export options */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center sm:justify-center mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-64 flex justify-between items-center text-center">
                    <span>Download Quiz</span>
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px] w-full max-w-xs md:min-w-[260px]">
                  <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Questions Only</div>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileText className="w-4 h-4 mr-2 text-blue-500" /> TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileSignature className="w-4 h-4 mr-2 text-purple-500" /> PDF
                  </DropdownMenuItem>
                  <div className="my-1 border-t" />
                  <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">With Attempts & Answers</div>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileText className="w-4 h-4 mr-2 text-blue-500" /> TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileSignature className="w-4 h-4 mr-2 text-purple-500" /> PDF
                  </DropdownMenuItem>
                  <div className="my-1 border-t" />
                  <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">Answer Key</div>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileText className="w-4 h-4 mr-2 text-blue-500" /> TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>
                    <FileSignature className="w-4 h-4 mr-2 text-purple-500" /> PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="default" size="sm" className="w-full sm:w-64 flex justify-center items-center text-center" onClick={() => {}} disabled={reportLoading}>
                <FileDown className="w-4 h-4 mr-2" />
                {reportLoading ? 'Generating Report...' : 'Download Report Card'}
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
              <div className="text-4xl font-bold mb-2 text-center">
                <span className={getScoreColor(scorePercentage)}>
                  {totalPoints} / {maxPossiblePoints} points
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {scorePercentage >= 80 ? 'Excellent work!' : 
                  scorePercentage >= 60 ? 'Good job!' : 
                  'Keep practicing!'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                ({scorePercentage}%)
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
                          Incorrect {negativeMarking && result.score < 0 ? `(${result.score})` : ''}
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-2">{question.question}</p>
                    
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, optIdx) => {
                        const isUserSelected = userAnswers.includes(optIdx);
                        const isCorrectOption = (question.correct_answers || []).includes(optIdx);
                        
                        let className = "pl-2 py-1 border-l-2 ";
                        let icon = null;
                        let status = '';
                        
                        if (question.type === 'multiple-correct') {
                          if (isCorrectOption) {
                            if (isUserSelected) {
                              icon = <CheckSquare className="h-4 w-4 text-green-600 mt-0.5" />;
                              className += "border-green-500 bg-green-100";
                              status = 'Correctly selected';
                            } else {
                              icon = <Square className="h-4 w-4 text-amber-600 mt-0.5" />;
                              className += "border-amber-500 bg-amber-100";
                              status = 'Missed correct answer';
                            }
                          } else {
                            if (isUserSelected) {
                              icon = <CheckSquare className="h-4 w-4 text-red-600 mt-0.5" />;
                              className += "border-red-500 bg-red-100";
                              status = 'Incorrectly selected';
                            } else {
                              icon = <Square className="h-4 w-4 text-slate-400 mt-0.5" />;
                              className += "border-transparent";
                            }
                          }
                        } else {
                          if (isCorrectOption) {
                            if (isUserSelected) {
                              icon = (
                                <div className="relative flex h-4 w-4 items-center justify-center">
                                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                              );
                              className += "border-green-500 bg-green-100";
                              status = 'Correct answer';
                            } else {
                              icon = (
                                <div className="relative flex h-4 w-4 items-center justify-center">
                                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                                </div>
                              );
                              className += "border-amber-500 bg-amber-100";
                              status = 'Missed correct answer';
                            }
                          } else {
                            if (isUserSelected) {
                              icon = (
                                <div className="relative flex h-4 w-4 items-center justify-center">
                                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                </div>
                              );
                              className += "border-red-500 bg-red-100";
                              status = 'Incorrect answer';
                            } else {
                              icon = (
                                <div className="relative flex h-4 w-4 items-center justify-center">
                                  <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                                </div>
                              );
                              className += "border-transparent";
                            }
                          }
                        }

                        return (
                          <div key={`${idx}-option-${optIdx}`} className={className}>
                            <div className="flex items-start gap-2">
                              {icon}
                              <div className="flex-1">
                                <span>{option}</span>
                                {status && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({status})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {result.partiallyCorrect && (
                      <div className="mt-2 text-sm text-amber-600">
                        Partial marks awarded: +{result.score} for selecting {result.score} correct option{result.score > 1 ? 's' : ''}
                      </div>
                    )}

                    {!result.isCorrect && !result.partiallyCorrect && result.score < 0 && negativeMarking && (
                      <div className="mt-2 text-sm text-red-600">
                        Negative marking: {result.score} points for selecting incorrect option{result.score < -1 ? 's' : ''}
                      </div>
                    )}

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

export default QuizResults