export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number; // index (0–3)
  explanation?: string;
}