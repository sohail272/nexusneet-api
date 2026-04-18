export const SUBJECTS = ["PHYSICS", "CHEMISTRY", "BOTANY", "ZOOLOGY"] as const;
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export type QuestionOptionInput = {
  text: string;
  isCorrect: boolean;
};

export type CreateQuestionInput = {
  questionText: string;
  explanation?: string;
  subject: Subject;
  chapter: string;
  difficulty?: Difficulty;
  topic?: string;
  source?: string;
  options: QuestionOptionInput[];
};

export type QuestionFilters = {
  subject?: Subject;
  chapter?: string;
  difficulty?: Difficulty;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};
