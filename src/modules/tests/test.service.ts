import { prisma } from "../../lib/prisma";
import { CreateTestInput } from "./test.types";

const DEFAULT_PUBLISH_MIN_QUESTIONS = 10;

export const createTest = async (data: CreateTestInput) => {
  const questionIds = [...new Set(data.questionIds)];

  const existingQuestions = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingQuestions.length !== questionIds.length) {
    throw new Error("One or more questionIds are invalid");
  }

  return prisma.test.create({
    data: {
      name: data.name,
      description: data.description,
      duration: data.duration,
      type: data.type,
      subject: data.subject,
      chapter: data.chapter,
      questions: {
        create: questionIds.map((questionId) => ({ questionId })),
      },
    },
    include: {
      questions: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });
};

export const listTests = async () => {
  return prisma.test.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });
};

export const getTestById = async (id: string) => {
  return prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      },
      _count: {
        select: {
          attempts: true,
        },
      },
    },
  });
};

export const publishTest = async (id: string) => {
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  if (!test) {
    return null;
  }

  if (test._count.questions < DEFAULT_PUBLISH_MIN_QUESTIONS) {
    throw new Error(
      `At least ${DEFAULT_PUBLISH_MIN_QUESTIONS} questions are required to publish a test`,
    );
  }

  return prisma.test.update({
    where: { id },
    data: {
      status: "PUBLISHED",
    },
  });
};
