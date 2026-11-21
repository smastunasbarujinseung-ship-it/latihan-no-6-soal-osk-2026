import test from 'node:test';
import assert from 'node:assert/strict';
import { PROBLEMS } from './problemsData';
import { THEORY_LEVELS } from './theoryData';
import { roundOneDecimal, solveProblemExact } from '../physics/inclineEngine';
import { normalizePhysicsSpeech } from '../utils/narrator';

test('All 15 problems exist, are sequentially numbered, and match exact analytical keys', () => {
  assert.equal(PROBLEMS.length, 15);
  PROBLEMS.forEach((p, idx) => {
    const expectedNum = idx + 1;
    assert.equal(p.number, expectedNum);
    assert.equal(p.id, expectedNum);
    assert.equal(p.hints.length, 3);
    assert.ok(p.questionText.length > 40);
    assert.ok(p.knownData.length >= 2);
    assert.ok(p.solution.memahamiPermasalahan.length > 20);
    assert.ok(p.solution.strategiCepatOlimpiade.length > 20);
    assert.ok(p.narration.soal.length > 20);
    assert.ok(p.narration.pembahasan.length > 20);

    const exact = solveProblemExact(expectedNum);
    assert.ok(Math.abs(p.exactAnswer - exact) < 1e-9);
    assert.equal(p.answerOneDecimal, roundOneDecimal(exact));
  });
});

test('Theory center contains all 5 progressive levels with formulas and narration', () => {
  assert.equal(THEORY_LEVELS.length, 5);
  THEORY_LEVELS.forEach((lvl, idx) => {
    assert.equal(lvl.level, idx + 1);
    assert.ok(lvl.sections.length >= 2);
    assert.ok(lvl.variables.length >= 2);
    assert.ok(lvl.narrationScript.length > 40);
  });
});

test('Narrator speech normalizer converts physics symbols to clean spoken Indonesian', () => {
  const spoken = normalizePhysicsSpeech('Hitung $\\Sigma F$ untuk $\\alpha = 53,6^\\circ$ dan $\\mu = 0,31$ dengan $v = \\frac{\\ell}{t}$');
  assert.ok(!spoken.includes('$'));
  assert.ok(!spoken.includes('\\'));
  assert.ok(spoken.includes('resultan gaya'));
  assert.ok(spoken.includes('sudut alfa'));
  assert.ok(spoken.includes('koefisien gesek miu'));
});
