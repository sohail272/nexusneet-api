import { Request, Response } from "express";
import { createQuestion, getQuestions } from "./question.service";
import {
  CreateQuestionInput,
  DIFFICULTIES,
  Difficulty,
  QuestionOptionInput,
  SUBJECTS,
  Subject,
} from "./question.types";

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const parseSubject = (value: unknown): Subject | null => {
  const subject = normalizeString(value).toUpperCase() as Subject;
  return SUBJECTS.includes(subject) ? subject : null;
};

const parseDifficulty = (value: unknown): Difficulty | undefined | null => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return undefined;
  }

  const difficulty = normalized.toUpperCase() as Difficulty;
  return DIFFICULTIES.includes(difficulty) ? difficulty : null;
};

const parseOptions = (value: unknown): QuestionOptionInput[] | null => {
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

const parsePaginationParam = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
};

const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
};

export const createQuestionHandler = async (req: Request, res: Response) => {
  try {
    const questionText = normalizeString(req.body?.questionText);
    const explanation = normalizeString(req.body?.explanation) || undefined;
    const subject = parseSubject(req.body?.subject);
    const chapter = normalizeString(req.body?.chapter);
    const difficulty = parseDifficulty(req.body?.difficulty);
    const topic = normalizeString(req.body?.topic) || undefined;
    const source = normalizeString(req.body?.source) || undefined;
    const options = parseOptions(req.body?.options);

    if (!questionText) {
      return res.status(400).json({ message: "questionText is required" });
    }

    if (!subject) {
      return res.status(400).json({
        message: `subject is required and must be one of: ${SUBJECTS.join(", ")}`,
      });
    }

    if (!chapter) {
      return res.status(400).json({ message: "chapter is required" });
    }

    if (difficulty === null) {
      return res.status(400).json({
        message: `difficulty must be one of: ${DIFFICULTIES.join(", ")}`,
      });
    }

    if (!options) {
      return res.status(400).json({
        message:
          "options must contain exactly 4 unique options with exactly one correct option",
      });
    }

    const payload: CreateQuestionInput = {
      questionText,
      explanation,
      subject,
      chapter,
      difficulty,
      topic,
      source,
      options,
    };

    const question = await createQuestion(payload);
    return res.status(201).json(question);
  } catch (error) {
    console.error("createQuestionHandler error:", error);
    return res.status(500).json({ message: "Failed to create question" });
  }
};

export const getQuestionsHandler = async (req: Request, res: Response) => {
  try {
    const subject = parseSubject(req.query.subject);
    const difficulty = parseDifficulty(req.query.difficulty);

    if (req.query.subject && !subject) {
      return res.status(400).json({
        message: `subject must be one of: ${SUBJECTS.join(", ")}`,
      });
    }

    if (difficulty === null) {
      return res.status(400).json({
        message: `difficulty must be one of: ${DIFFICULTIES.join(", ")}`,
      });
    }

    const page = parsePaginationParam(req.query.page);
    const limit = parsePaginationParam(req.query.limit);

    const questions = await getQuestions({
      subject: subject ?? undefined,
      chapter: normalizeString(req.query.chapter) || undefined,
      difficulty,
      isActive: parseBooleanQuery(req.query.isActive),
      search: normalizeString(req.query.search) || undefined,
      page,
      limit,
    });

    return res.status(200).json(questions);
  } catch (error) {
    console.error("getQuestionsHandler error:", error);
    return res.status(500).json({ message: "Failed to fetch questions" });
  }
};
