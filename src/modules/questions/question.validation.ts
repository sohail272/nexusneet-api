import {
  DIFFICULTIES,
  Difficulty,
  QuestionOptionInput,
  SUBJECTS,
  Subject,
} from "./question.types";

export const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const parseSubject = (value: unknown): Subject | null => {
  const subject = normalizeString(value).toUpperCase() as Subject;
  return SUBJECTS.includes(subject) ? subject : null;
};

export const parseDifficulty = (value: unknown): Difficulty | undefined | null => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return undefined;
  }

  const difficulty = normalized.toUpperCase() as Difficulty;
  return DIFFICULTIES.includes(difficulty) ? difficulty : null;
};

export const parseOptions = (value: unknown): QuestionOptionInput[] | null => {
  if (!Array.isArray(value) || value.length !== 4) {
    return null;
  }

  const options = value.map((option) => ({
    text: normalizeString((option as { text?: unknown }).text),
    isCorrect: Boolean((option as { isCorrect?: unknown }).isCorrect),
  }));

  if (options.some((option) => option.text.length === 0)) {
    return null;
  }

  const normalizedOptionTexts = options.map((option) => option.text.toLowerCase());
  if (new Set(normalizedOptionTexts).size !== options.length) {
    return null;
  }

  const correctOptionCount = options.filter((option) => option.isCorrect).length;
  if (correctOptionCount !== 1) {
    return null;
  }

  return options;
};

export const parsePaginationParam = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
};

export const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
};
