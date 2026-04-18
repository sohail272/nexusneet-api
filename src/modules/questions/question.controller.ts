import { Request, Response } from "express";
import { createQuestion, getQuestions } from "./question.service";
import { CreateQuestionInput, DIFFICULTIES, SUBJECTS } from "./question.types";
import {
  normalizeString,
  parseBooleanQuery,
  parseDifficulty,
  parseOptions,
  parsePaginationParam,
  parseSubject,
} from "./question.validation";

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
