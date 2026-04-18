import { prisma } from "../../lib/prisma";

type CreateQuestionInput = {
  questionText: string;
  explanation?: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
};

export const createQuestion = async (data: CreateQuestionInput) => {
  const question = await prisma.question.create({
    data: {
      questionText: data.questionText,
      explanation: data.explanation,
      options: {
        create: data.options,
      },
    },
    include: {
      options: true,
    },
  });

  return question;
};

export const getQuestions = async () => {
  return prisma.question.findMany({
    include: {
      options: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};