import { prisma } from "../../lib/prisma";
import { CreateQuestionInput, QuestionFilters } from "./question.types";

export const createQuestion = async (data: CreateQuestionInput) => {
  return prisma.question.create({
    data: {
      questionText: data.questionText,
      explanation: data.explanation,
      subject: data.subject,
      chapter: data.chapter,
      difficulty: data.difficulty,
      topic: data.topic,
      source: data.source,
      options: {
        create: data.options,
      },
    },
    include: {
      options: true,
    },
  });
};

export const getQuestions = async (filters: QuestionFilters) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.subject ? { subject: filters.subject } : {}),
    ...(filters.chapter
      ? { chapter: { equals: filters.chapter, mode: "insensitive" as const } }
      : {}),
    ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    ...(typeof filters.isActive === "boolean" ? { isActive: filters.isActive } : {}),
    ...(filters.search
      ? {
          questionText: {
            contains: filters.search,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      include: {
        options: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
