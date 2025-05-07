// Utility functions to generate quiz download content for different modes
// Copied from ProfilePage.tsx for type safety
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
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Helper to download a string as a PDF file (requires jsPDF)
export async function downloadPdfFile(filename: string, content: string) {
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
  doc.save(filename);
}

