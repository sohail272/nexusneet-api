export type ScoringRule = {
  marksForCorrect: number;
  marksForWrong: number;
};

export const DEFAULT_SCORING_RULE: ScoringRule = {
  marksForCorrect: 4,
  marksForWrong: -1,
};

export type ScoringInput = {
  selectedOptionId?: string | null;
  correctOptionId?: string | null;
};

export type ScoringSummary = {
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  outcomes: Array<{ isCorrect: boolean | null }>;
};

export const calculateAttemptSummary = (
  answers: ScoringInput[],
  rule: ScoringRule = DEFAULT_SCORING_RULE,
): ScoringSummary => {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const outcomes = answers.map((answer) => {
    if (!answer.selectedOptionId) {
      unansweredCount += 1;
      return { isCorrect: null };
    }

    const isCorrect = answer.correctOptionId === answer.selectedOptionId;

    if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }

    return { isCorrect };
  });

  const score =
    correctCount * rule.marksForCorrect + wrongCount * rule.marksForWrong;

  return {
    score,
    correctCount,
    wrongCount,
    unansweredCount,
    outcomes,
  };
};
