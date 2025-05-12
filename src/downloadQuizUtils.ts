// Utility functions to generate quiz download content for different modes
// Copied from ProfilePage.tsx for type safety
const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

export interface Question {
  question: string;
  options: string[];
  correctAnswers: number[];
  selectedAnswers: number[];
  isCorrect: boolean;
  partiallyCorrect: boolean;
  score: number;
  explanation: string;
  timeTaken: number;
}

export interface Quiz {
  id: string;
  topic: string;
  subtopic: string;
  date: string;
  percentage: number;
  total_possible_score: number;
  score: number;
  timeSpent: number;
  negativeMarking: boolean;
  question_type: 'mcq' | 'multiple-correct' | 'true-false';
  questions: Question[];
}


// 1. Download quiz without attempts, answers, explanations
export function generateQuizQuestionsOnly(quiz: Quiz): string {
  if (!quiz || !Array.isArray(quiz.questions)) return 'No questions available.';
  return quiz.questions.map((q, idx) => {
    return `Q${idx + 1}. ${q.question}\n` +
      q.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`).join('\n') + '\n';
  }).join('\n');
}

// 2. Download quiz with attempts, marked and correct answers, explanations
export function generateQuizWithAttempts(quiz: Quiz): string {
  if (!quiz || !Array.isArray(quiz.questions)) return 'No questions available.';
  return quiz.questions.map((q, idx) => {
    const userAnswers = q.selectedAnswers?.map(i => String.fromCharCode(65 + i)).join(', ') || '-';
    const correctAnswers = q.correctAnswers.map(i => String.fromCharCode(65 + i)).join(', ');
    return `Q${idx + 1}. ${q.question}\n` +
      q.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`).join('\n') + '\n' +
      `   Your answer: ${userAnswers}\n   Correct answer: ${correctAnswers}\n` +
      (q.explanation ? `   Explanation: ${q.explanation}\n` : '') + '\n';
  }).join('\n');
}

// 3. Download only correct answers key with explanation
export function generateQuizAnswerKey(quiz: Quiz): string {
  if (!quiz || !Array.isArray(quiz.questions)) return 'No questions available.';
  return quiz.questions.map((q, idx) => {
    const correctAnswers = q.correctAnswers.map(i => String.fromCharCode(65 + i)).join(', ');
    const optionsStr = q.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
    return `Q${idx + 1}. ${q.question}\n` +
      optionsStr + '\n' +
      `   Correct answer: ${correctAnswers}\n` +
      (q.explanation ? `   Explanation: ${q.explanation}\n` : '') + '\n';
  }).join('\n');
}

// Helper to download a string as a .txt file
export async function uploadTextFile(filename: string, content: string, quiz_attempt_id: number) {
  const formData = new FormData();
  const file = new Blob([content], { type: 'text/plain' });
  formData.append('file', file, filename);
  formData.append('quiz_attempt_id', `${quiz_attempt_id}`);

  const response = await fetch(API_URL + '/quiz-downloads/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to upload text file');
  }
  return await response.json();
}

// Helper to download a string as a PDF file (requires jsPDF)
export async function uploadPdfFile(filename: string, content: string, quiz_attempt_id: number) {
  const jsPDF = (await import('jspdf')).jsPDF;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const lines = content.split('\n');
  let y = margin;
  const lineHeight = 8;
  lines.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, usableWidth);
    wrappedLines.forEach(wrappedLine => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(wrappedLine, margin, y);
      y += lineHeight;
    });
  });

  // Get PDF as Blob
  const pdfBlob = doc.output('blob');
  const formData = new FormData();
  formData.append('file', pdfBlob, filename);
  formData.append('quiz_attempt_id', `${quiz_attempt_id}`);

  const response = await fetch(API_URL + '/quiz-downloads/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to upload PDF file');
  }
  return await response.json();
}

