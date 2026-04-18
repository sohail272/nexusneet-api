import test from 'node:test';
import assert from 'node:assert/strict';

const validation = await import('../dist/modules/questions/question.validation.js');

const { parseOptions, parseSubject, parseDifficulty, parsePaginationParam, parseBooleanQuery } = validation;

test('parseSubject accepts known values case-insensitively', () => {
  assert.equal(parseSubject('physics'), 'PHYSICS');
  assert.equal(parseSubject('CHEMISTRY'), 'CHEMISTRY');
});

test('parseSubject rejects unknown values', () => {
  assert.equal(parseSubject('maths'), null);
});

test('parseDifficulty handles empty, valid, and invalid values', () => {
  assert.equal(parseDifficulty(''), undefined);
  assert.equal(parseDifficulty('hard'), 'HARD');
  assert.equal(parseDifficulty('very-hard'), null);
});

test('parseOptions enforces exactly four options with one correct answer', () => {
  const valid = parseOptions([
    { text: 'A', isCorrect: false },
    { text: 'B', isCorrect: true },
    { text: 'C', isCorrect: false },
    { text: 'D', isCorrect: false },
  ]);

  assert.ok(valid);
  assert.equal(valid.length, 4);

  const invalidCount = parseOptions([
    { text: 'A', isCorrect: false },
    { text: 'B', isCorrect: true },
  ]);
  assert.equal(invalidCount, null);

  const invalidDuplicate = parseOptions([
    { text: 'A', isCorrect: false },
    { text: 'A', isCorrect: true },
    { text: 'C', isCorrect: false },
    { text: 'D', isCorrect: false },
  ]);
  assert.equal(invalidDuplicate, null);

  const invalidCorrectCount = parseOptions([
    { text: 'A', isCorrect: true },
    { text: 'B', isCorrect: true },
    { text: 'C', isCorrect: false },
    { text: 'D', isCorrect: false },
  ]);
  assert.equal(invalidCorrectCount, null);
});

test('query parsers handle booleans and pagination', () => {
  assert.equal(parseBooleanQuery('true'), true);
  assert.equal(parseBooleanQuery('false'), false);
  assert.equal(parseBooleanQuery('yes'), undefined);

  assert.equal(parsePaginationParam('3'), 3);
  assert.equal(parsePaginationParam('0'), undefined);
  assert.equal(parsePaginationParam('abc'), undefined);
});
