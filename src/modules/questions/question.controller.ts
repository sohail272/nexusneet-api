import { Request, Response } from "express";
import { createQuestion, getQuestions } from "./question.service";

export const createQuestionHandler = async (req: Request, res: Response) => {
  try {
    const { questionText, explanation, options } = req.body;

    if (!questionText || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({
        message: "questionText and options are required",
      });
    }

    const question = await createQuestion({
      questionText,
      explanation,
      options,
    });

    return res.status(201).json(question);
  } catch (error) {
    console.error("createQuestionHandler error:", error);
    return res.status(500).json({ message: "Failed to create question" });
  }
};

export const getQuestionsHandler = async (_req: Request, res: Response) => {
  try {
    const questions = await getQuestions();
    return res.status(200).json(questions);
  } catch (error) {
    console.error("getQuestionsHandler error:", error);
    return res.status(500).json({ message: "Failed to fetch questions" });
  }
};