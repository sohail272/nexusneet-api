export const TEST_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export const TEST_TYPES = ["CHAPTER", "MOCK", "CUSTOM"] as const;
export const SUBJECTS = ["PHYSICS", "CHEMISTRY", "BOTANY", "ZOOLOGY"] as const;

export type TestStatus = (typeof TEST_STATUSES)[number];
export type TestType = (typeof TEST_TYPES)[number];
export type Subject = (typeof SUBJECTS)[number];

export type CreateTestInput = {
  name: string;
  description?: string;
  duration?: number;
  type?: TestType;
  subject?: Subject;
  chapter?: string;
  questionIds: string[];
};
