import { Request, Response } from "express";
import { createTest, getTestById, listTests, publishTest } from "./test.service";
import { SUBJECTS, TEST_TYPES } from "./test.types";

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const getSingleParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const parseSubject = (value: unknown) => {
  const normalized = normalizeString(value).toUpperCase();
  if (!normalized) {
    return undefined;
  }

  return SUBJECTS.includes(normalized as (typeof SUBJECTS)[number])
    ? (normalized as (typeof SUBJECTS)[number])
    : null;
};

const parseTestType = (value: unknown) => {
  const normalized = normalizeString(value).toUpperCase();
  if (!normalized) {
    return undefined;
  }

  return TEST_TYPES.includes(normalized as (typeof TEST_TYPES)[number])
    ? (normalized as (typeof TEST_TYPES)[number])
    : null;
};

export const createTestHandler = async (req: Request, res: Response) => {
  try {
    const name = normalizeString(req.body?.name);
    const description = normalizeString(req.body?.description) || undefined;
    const duration = Number(req.body?.duration);
    const questionIds = Array.isArray(req.body?.questionIds) ? req.body.questionIds : [];
    const subject = parseSubject(req.body?.subject);
    const type = parseTestType(req.body?.type);
    const chapter = normalizeString(req.body?.chapter) || undefined;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "questionIds is required" });
    }

    if (subject === null) {
      return res.status(400).json({
        message: `subject must be one of: ${SUBJECTS.join(", ")}`,
      });
    }

    if (type === null) {
      return res.status(400).json({
        message: `type must be one of: ${TEST_TYPES.join(", ")}`,
      });
    }

    const test = await createTest({
      name,
      description,
      duration: Number.isFinite(duration) ? duration : undefined,
      type,
      subject,
      chapter,
      questionIds,
    });

    return res.status(201).json(test);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error("createTestHandler error:", error);
    return res.status(500).json({ message: "Failed to create test" });
  }
};

export const listTestsHandler = async (_req: Request, res: Response) => {
  try {
    const tests = await listTests();
    return res.status(200).json(tests);
  } catch (error) {
    console.error("listTestsHandler error:", error);
    return res.status(500).json({ message: "Failed to list tests" });
  }
};

export const getTestByIdHandler = async (req: Request, res: Response) => {
  try {
    const test = await getTestById(getSingleParam(req.params.id));

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    return res.status(200).json(test);
  } catch (error) {
    console.error("getTestByIdHandler error:", error);
    return res.status(500).json({ message: "Failed to fetch test" });
  }
};

export const publishTestHandler = async (req: Request, res: Response) => {
  try {
    const test = await publishTest(getSingleParam(req.params.id));

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    return res.status(200).json(test);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error("publishTestHandler error:", error);
    return res.status(500).json({ message: "Failed to publish test" });
  }
};
