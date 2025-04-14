
export type QuizQuestionType = 'mcq' | 'true-false' | 'multiple-correct';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

// Sample quiz for Python topic
export const pythonQuiz: QuizData = {
  topic: 'Python',
  questions: [
    // MCQ Questions
    {
      id: 'py-mcq-1',
      type: 'mcq',
      question: 'Which of the following is the correct way to create a variable in Python?',
      options: [
        'var x = 5;',
        'x = 5',
        'variable x = 5',
        'int x = 5;'
      ],
      correctAnswers: [1],
      explanation: 'In Python, you can directly assign a value to a variable without declaring its type or using special keywords.'
    },
    {
      id: 'py-mcq-2',
      type: 'mcq',
      question: 'What will be the output of the following code?\n\nx = 10\nprint(x + 5)',
      options: [
        '10',
        '5',
        '15',
        'Error'
      ],
      correctAnswers: [2],
      explanation: 'The code adds 5 to the variable x (which is 10) and prints the result, which is 15.'
    },
    
    // True-False Questions
    {
      id: 'py-tf-1',
      type: 'true-false',
      question: 'Python is a statically typed programming language.',
      options: [
        'True',
        'False'
      ],
      correctAnswers: [1],
      explanation: 'Python is a dynamically typed language, which means variable types are determined at runtime.'
    },
    {
      id: 'py-tf-2',
      type: 'true-false',
      question: 'In Python, indentation is used to define code blocks.',
      options: [
        'True',
        'False'
      ],
      correctAnswers: [0],
      explanation: 'Unlike many other programming languages that use braces {}, Python uses indentation to define code blocks.'
    },
    
    // Multiple Correct Questions
    {
      id: 'py-mc-1',
      type: 'multiple-correct',
      question: 'Which of the following are valid Python data types?',
      options: [
        'Integer',
        'String',
        'Boolean',
        'Character'
      ],
      correctAnswers: [0, 1, 2],
      explanation: 'Python has int, str, and bool data types. It does not have a separate character data type; characters are represented as strings of length 1.'
    },
    {
      id: 'py-mc-2',
      type: 'multiple-correct',
      question: 'Which of the following are Python collection data types?',
      options: [
        'List',
        'Dict',
        'Set',
        'Array'
      ],
      correctAnswers: [0, 1, 2],
      explanation: 'List, Dictionary (dict), and Set are built-in collection types in Python. "Array" is not a built-in type (though the numpy library provides array functionality).'
    }
  ]
};

// Sample quiz for React topic
export const reactQuiz: QuizData = {
  topic: 'React',
  questions: [
    // MCQ Questions
    {
      id: 'react-mcq-1',
      type: 'mcq',
      question: 'What is the correct way to create a functional component in React?',
      options: [
        'function MyComponent() { return <div>Hello</div>; }',
        'class MyComponent { render() { return <div>Hello</div>; } }',
        'const MyComponent = function() => <div>Hello</div>;',
        'render(<div>Hello</div>);'
      ],
      correctAnswers: [0],
      explanation: 'A functional component in React is a JavaScript function that returns JSX.'
    },
    
    // True-False Questions
    {
      id: 'react-tf-1',
      type: 'true-false',
      question: 'In React, components must always start with a lowercase letter.',
      options: [
        'True',
        'False'
      ],
      correctAnswers: [1],
      explanation: 'In React, custom components must start with an uppercase letter to distinguish them from HTML elements.'
    },
    
    // Multiple Correct Questions
    {
      id: 'react-mc-1',
      type: 'multiple-correct',
      question: 'Which of the following are React hooks?',
      options: [
        'useState',
        'useEffect',
        'useContext',
        'useRender'
      ],
      correctAnswers: [0, 1, 2],
      explanation: 'useState, useEffect, and useContext are built-in React hooks. useRender is not a built-in React hook.'
    }
  ]
};

// Get quiz data based on topic
export const getQuizByTopic = async (topic: string, question_type: string, num_questions: number): Promise<QuizData> => {
  const lowerCaseTopic = topic.toLowerCase();
  
  try {
    const response = await fetch('http://localhost:8000/gemini-search/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        topic: lowerCaseTopic,
        num_questions: num_questions,
        question_type: question_type
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {topic: lowerCaseTopic, questions: data.quiz.quiz}
  } catch (err) {
    return {"topic": "error", "questions": []};
  }
};
