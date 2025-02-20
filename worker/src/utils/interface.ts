import ProgrammingLanguage from "./enum";

export interface Solutions {
  sucess: boolean;
  error?: string;
  output?: string;
}

export interface EvaluationResult {
  success: boolean;
  error?: string;
  output?: string;
  executionTime?: number;
}

export interface Submissions {
  code: string;
  language: keyof typeof ProgrammingLanguage;
  problemId: string;
}
