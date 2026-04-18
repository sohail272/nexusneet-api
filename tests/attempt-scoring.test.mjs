import test from 'node:test';
import assert from 'node:assert/strict';

const scoring = await import('../dist/modules/attempts/attempt.scoring.js');

const { calculateAttemptSummary } = scoring;

test('calculateAttemptSummary computes score and counters correctly', () => {
  const result = calculateAttemptSummary([
    { selectedOptionId: 'opt-1', correctOptionId: 'opt-1' },
    { selectedOptionId: 'opt-3', correctOptionId: 'opt-2' },
    { selectedOptionId: null, correctOptionId: 'opt-4' },
  ]);

  assert.equal(result.correctCount, 1);
  assert.equal(result.wrongCount, 1);
  assert.equal(result.unansweredCount, 1);
  assert.equal(result.score, 3);
  assert.deepEqual(result.outcomes, [
    { isCorrect: true },
    { isCorrect: false },
    { isCorrect: null },
  ]);
});

test('calculateAttemptSummary supports custom scoring rules', () => {
  const result = calculateAttemptSummary(
    [
      { selectedOptionId: 'opt-1', correctOptionId: 'opt-1' },
      { selectedOptionId: 'opt-3', correctOptionId: 'opt-2' },
    ],
    { marksForCorrect: 5, marksForWrong: -2 },
  );

  assert.equal(result.score, 3);
});
