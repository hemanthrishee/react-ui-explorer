// Utility for downloading quiz files using backend presigned URLs

export type QuizDownloadFileType =
  | 'questions_txt'
  | 'questions_pdf'
  | 'answers_txt'
  | 'answers_pdf'
  | 'user_attempt_txt'
  | 'user_attempt_pdf'
  | 'report_pdf';

export async function downloadQuizFilePresigned(
  quiz_attempt_id: number | string,
  file_type: QuizDownloadFileType,
  api_url: string,
  fileName?: string
) {
  const url = `${api_url}/quiz-downloads/get-quiz-download-url?quiz_attempt_id=${quiz_attempt_id}&file_type=${file_type}`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok || data.status !== 'success' || !data.signed_url) {
    throw new Error(data.message || 'Could not get download URL');
  }
  const fileRes = await fetch(data.signed_url);
  if (!fileRes.ok) throw new Error('Failed to download file');
  const blob = await fileRes.blob();
  const dlName = fileName || `${file_type}_${quiz_attempt_id}`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = dlName;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 1000);
}
