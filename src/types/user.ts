
export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  profilePicture?: string;
  qualifications?: string;
  expertise?: string[];
  joinedAt: Date;
}

export interface Class {
  id: string;
  teacherId: string;
  title: string;
  topic: string;
  description: string;
  maxStudents: number | null;
  currentStudents: number;
  isFree: boolean;
  price?: number;
  teacherImage?: string;
  teacherQualifications?: string;
  teacherExpertise?: string;
  registrationDeadline: Date | null;
  startDate: Date | null;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  responseDate?: Date;
}

export interface CodingContest {
  id: string;
  classId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  timeLimit: number; // in minutes
  questions: CodingQuestion[];
  createdAt: Date;
}

export interface CodingQuestion {
  id: string;
  contestId: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  initialCode: { [language: string]: string };
  testCases: {
    input: string;
    expected: string;
  }[];
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  questionId: string;
  studentId: string;
  code: string;
  language: string;
  status: 'pending' | 'passed' | 'failed';
  submittedAt: Date;
  results?: {
    passed: number;
    failed: number;
    testDetails: Array<{
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
    }>;
  };
}
