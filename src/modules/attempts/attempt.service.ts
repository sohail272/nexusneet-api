import { prisma } from "../../lib/prisma";

const SCORE_FOR_CORRECT = 4;
const SCORE_FOR_WRONG = -1;

const getPublishedTestWithQuestions = async (testId: string) => {
  return prisma.test.findFirst({
    where: {
      id: testId,
      status: "PUBLISHED",
      isActive: true,
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

export const startAttempt = async ({
  testId,
  userId,
}: {
  testId: string;
  userId: string;
}) => {
  const test = await getPublishedTestWithQuestions(testId);

  if (!test) {
    throw new Error("Test is not available for attempts");
  }

  if (test.questions.length === 0) {
    throw new Error("This test has no questions");
  }

  const attempt = await prisma.attempt.create({
    data: {
      testId,
      userId,
      answers: {
        create: test.questions.map((testQuestion) => ({
          questionId: testQuestion.questionId,
        })),
      },
    },
  });

  return {
    attempt,
    questions: test.questions.map((item) => item.question),
  };
};

export const saveAttemptAnswers = async ({
  attemptId,
  answers,
}: {
  attemptId: string;
  answers: { questionId: string; selectedOptionId?: string; markedForReview?: boolean }[];
}) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt is already submitted");
  }

  await prisma.$transaction(
    answers.map((answer) =>
      prisma.attemptAnswer.updateMany({
        where: {
          attemptId,
          questionId: answer.questionId,
        },
        data: {
          selectedOptionId: answer.selectedOptionId,
          markedForReview: Boolean(answer.markedForReview),
        },
      }),
    ),
  );

  return prisma.attemptAnswer.findMany({
    where: { attemptId },
  });
};

export const submitAttempt = async (attemptId: string) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
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

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt is already submitted");
  }

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const answerUpdates = attempt.answers.map((answer) => {
    if (!answer.selectedOptionId) {
      unansweredCount += 1;
      return { id: answer.id, isCorrect: null as boolean | null };
    }

    const correctOption = answer.question.options.find((option) => option.isCorrect);
    const isCorrect = correctOption?.id === answer.selectedOptionId;

    if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }

    return { id: answer.id, isCorrect };
  });

  const score = correctCount * SCORE_FOR_CORRECT + wrongCount * SCORE_FOR_WRONG;
  const timeTakenSeconds = Math.max(
    0,
    Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000),
  );

  return prisma.$transaction(async (tx) => {
    for (const answerUpdate of answerUpdates) {
      await tx.attemptAnswer.update({
        where: { id: answerUpdate.id },
        data: {
          isCorrect: answerUpdate.isCorrect,
        },
      });
    }

    return tx.attempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        score,
        correctCount,
        wrongCount,
        unansweredCount,
        timeTakenSeconds,
      },
      include: {
        answers: true,
      },
    });
  });
};

export const getAttemptResult = async (attemptId: string) => {
  return prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },
    include: {
      answers: {
        include: {
          question: true,
          selectedOption: true,
        },
      },
      test: true,
    },
  });
};
