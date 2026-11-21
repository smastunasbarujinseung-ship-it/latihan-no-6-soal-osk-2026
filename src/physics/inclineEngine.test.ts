import test from 'node:test';
import assert from 'node:assert/strict';
import {
  roundOneDecimal,
  formatIndonesianDecimal,
  parseNumericInput,
  checkNumericalAnswer,
  computeOptimalAngle,
  computeDescentTime,
  computeMinDescentTime,
  computeConjugateAngle,
  computeSphereDescentTime,
  computeSphereOptimalAngle,
  computeMaxHorizontalExitSpeed,
  computeOptimalAngleTiltedTarget,
  computeInclinePlusFloorTotalTime,
  solveProblemExact,
  simulateInclineStep,
} from './inclineEngine';

test('Indonesian decimal parsing, normalization, and rounding work accurately', () => {
  assert.equal(parseNumericInput('53,6'), 53.6);
  assert.equal(parseNumericInput('53.6'), 53.6);
  assert.equal(parseNumericInput(' -3,4 '), -3.4);
  assert.equal(parseNumericInput('0,8'), 0.8);
  assert.equal(parseNumericInput('abc'), null);
  assert.equal(parseNumericInput(''), null);

  assert.equal(roundOneDecimal(3.4496), 3.4);
  assert.equal(roundOneDecimal(1.07858), 1.1);
  assert.equal(roundOneDecimal(53.6117), 53.6);
  assert.equal(roundOneDecimal(53.65), 53.7);
  assert.equal(formatIndonesianDecimal(53.6117), '53,6');

  const checkOk = checkNumericalAnswer('53,6', solveProblemExact(5));
  assert.equal(checkOk.valid, true);
  assert.equal(checkOk.isCorrect, true);

  const checkDotOk = checkNumericalAnswer('53.6', solveProblemExact(5));
  assert.equal(checkDotOk.isCorrect, true);

  const checkWrong = checkNumericalAnswer('45,0', solveProblemExact(5));
  assert.equal(checkWrong.isCorrect, false);
});

test('All 15 problems solve to expected exact & rounded 1-decimal values', () => {
  const expectedRounded: Record<number, number> = {
    1: 3.4,
    2: 1.1,
    3: 4.9,
    4: 3.4,
    5: 53.6,
    6: 1.6,
    7: 69.2,
    8: 52.6,
    9: 0.4,
    10: 61.6,
    11: 52.0,
    12: 4.7,
    13: 54.8,
    14: 70.9,
    15: 3.3,
  };

  for (let i = 1; i <= 15; i++) {
    const exact = solveProblemExact(i);
    const rounded = roundOneDecimal(exact);
    assert.equal(
      rounded,
      expectedRounded[i],
      `Problem ${i} exact=${exact} rounded=${rounded} expected=${expectedRounded[i]}`
    );
  }
});

test('Soal 6 optimal angle strictly minimizes descent time compared to neighboring angles', () => {
  const l = 2.1;
  const mu = 0.31;
  const opt = computeOptimalAngle(mu);
  const tOpt = computeDescentTime(l, opt, mu, 9.8);
  const tMinAnalytical = computeMinDescentTime(l, mu, 9.8);

  assert.ok(Math.abs(tOpt - tMinAnalytical) < 1e-9);
  assert.ok(tOpt < computeDescentTime(l, opt - 0.5, mu, 9.8));
  assert.ok(tOpt < computeDescentTime(l, opt + 0.5, mu, 9.8));
  assert.ok(tOpt < computeDescentTime(l, 45, mu, 9.8));
});

test('Conjugate angle symmetry in Problem 7 yields identical descent times', () => {
  const l = 2.1;
  const mu = 0.31;
  const a1 = 38.0;
  const a2 = computeConjugateAngle(a1, mu);
  const t1 = computeDescentTime(l, a1, mu, 9.8);
  const t2 = computeDescentTime(l, a2, mu, 9.8);
  assert.ok(Math.abs(t1 - t2) < 1e-9);
});

test('Solid sphere rolling vs slipping optimization (Problem 11) correctly verifies slipping beats pure rolling for mu=0.25', () => {
  const res = computeSphereOptimalAngle(2.8, 0.25, 9.8);
  assert.equal(res.regime, 'slipping');
  assert.equal(roundOneDecimal(res.optimalAngleDeg), 52.0);
  const tOpt = computeSphereDescentTime(2.8, res.optimalAngleDeg, 0.25, 9.8).time;
  const t45 = computeSphereDescentTime(2.8, 41.0, 0.25, 9.8).time;
  assert.ok(tOpt < t45);
});

test('Horizontal exit velocity duality (Problem 12) matches v_x = 2*l / t_min', () => {
  const l = 4.5;
  const mu = 0.75;
  const g = 9.8;
  const vxMax = computeMaxHorizontalExitSpeed(l, mu, g);
  const tMin = computeMinDescentTime(l, mu, g);
  assert.ok(Math.abs(vxMax - (2 * l) / tMin) < 1e-9);
});

test('Tilted target wall (Problem 14) reduces to Soal 6 when psi = 90 deg', () => {
  const mu = 0.31;
  assert.ok(
    Math.abs(computeOptimalAngleTiltedTarget(90, mu) - computeOptimalAngle(mu)) < 1e-9
  );
});

test('Numerical simulation matches analytical descent time for Soal 6', () => {
  const l = 2.1;
  const mu = 0.31;
  const alpha = computeOptimalAngle(mu);
  let state = { t: 0, s: 0, v: 0, a: 0, x: 0, y: 0, finished: false };
  const dt = 0.001;
  while (!state.finished && state.t < 10) {
    state = simulateInclineStep(state, dt, alpha, mu, l, 9.8);
  }
  assert.equal(state.finished, true);
  const analyticalTime = computeMinDescentTime(l, mu, 9.8);
  assert.ok(Math.abs(state.t - analyticalTime) < 1e-4);
});

test('Problem 15 incline + flat floor total time matches analytical identity', () => {
  const res = computeInclinePlusFloorTotalTime(3.0, 0.4, 10);
  const expectedV = Math.sqrt(2 * 10 * 3.0 * Math.sqrt(1 + 0.16));
  assert.ok(Math.abs(res.vBottom - expectedV) < 1e-9);
  assert.equal(roundOneDecimal(res.tTotal), 3.3);
});
