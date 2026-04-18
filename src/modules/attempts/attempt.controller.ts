import { Request, Response } from "express";
import {
  getAttemptResult,
  saveAttemptAnswers,
  startAttempt,
  submitAttempt,
} from "./attempt.service";

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const startAttemptHandler = async (req: Request, res: Response) => {
  try {
    const testId = normalizeString(req.params.testId);
    const userId = normalizeString(req.body?.userId);

    if (!testId) {
      return res.status(400).json({ message: "testId is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const result = await startAttempt({ testId, userId });
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error("startAttemptHandler error:", error);
    return res.status(500).json({ message: "Failed to start attempt" });
  }
};

export const saveAttemptAnswersHandler = async (req: Request, res: Response) => {
  try {
    const attemptId = normalizeString(req.params.attemptId);
    const answers: Array<{
      questionId?: unknown;
      selectedOptionId?: unknown;
      markedForReview?: unknown;
    }> = Array.isArray(req.body?.answers) ? req.body.answers : [];

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    if (!answers.length) {
      return res.status(400).json({ message: "answers are required" });
    }

    const invalidAnswer = answers.find(
      (answer) =>
        !normalizeString(answer?.questionId) ||
        (answer?.selectedOptionId !== undefined &&
          typeof answer?.selectedOptionId !== "string"),
    );

    if (invalidAnswer) {
      return res.status(400).json({
        message: "each answer must include questionId and optional selectedOptionId",
      });
    }

    const result = await saveAttemptAnswers({
      attemptId,
      answers: answers.map((answer) => ({
        questionId: normalizeString(answer.questionId),
        selectedOptionId: normalizeString(answer.selectedOptionId) || undefined,
        markedForReview: Boolean(answer.markedForReview),
      })),
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error("saveAttemptAnswersHandler error:", error);
    return res.status(500).json({ message: "Failed to save attempt answers" });
  }
};

export const submitAttemptHandler = async (req: Request, res: Response) => {
  try {
    const attemptId = normalizeString(req.params.attemptId);

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    const result = await submitAttempt(attemptId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error("submitAttemptHandler error:", error);
    return res.status(500).json({ message: "Failed to submit attempt" });
  }
};

export const getAttemptResultHandler = async (req: Request, res: Response) => {
  try {
    const attemptId = normalizeString(req.params.attemptId);

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    const result = await getAttemptResult(attemptId);

    if (!result) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("getAttemptResultHandler error:", error);
    return res.status(500).json({ message: "Failed to fetch attempt result" });
  }
};
