export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export function toRadians(deg: number): number {
  return deg * DEG_TO_RAD;
}

export function toDegrees(rad: number): number {
  return rad * RAD_TO_DEG;
}

/**
 * Standard mathematical rounding to 1 decimal place.
 * Handles floating point representation safely before rounding.
 */
export function roundOneDecimal(value: number): number {
  if (!Number.isFinite(value)) return NaN;
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  const rounded = Math.round((abs + 1e-12) * 10) / 10;
  return Object.is(sign * rounded, -0) ? 0 : sign * rounded;
}

/**
 * Format a number with exactly 1 decimal place using Indonesian comma separator.
 */
export function formatIndonesianDecimal(value: number): string {
  const rounded = roundOneDecimal(value);
  if (!Number.isFinite(rounded)) return '0,0';
  return rounded.toFixed(1).replace('.', ',');
}

/**
 * Parse user numeric input accepting either comma or dot as decimal separator.
 * Rejects empty strings, NaN, Infinity, or invalid characters.
 */
export function parseNumericInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s+/g, '');
  if (!trimmed) return null;
  // Allow optional leading +/-, digits, optional single decimal separator (comma or dot), digits
  if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/.test(trimmed)) {
    return null;
  }
  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

/**
 * Check whether user's numerical answer matches the expected key when rounded to 1 decimal place.
 */
export function checkNumericalAnswer(
  rawInput: string,
  expectedExactOrRounded: number
): {
  valid: boolean;
  parsedValue: number | null;
  roundedUser: number | null;
  expectedRounded: number;
  isCorrect: boolean;
} {
  const parsed = parseNumericInput(rawInput);
  const expectedRounded = roundOneDecimal(expectedExactOrRounded);
  if (parsed === null) {
    return {
      valid: false,
      parsedValue: null,
      roundedUser: null,
      expectedRounded,
      isCorrect: false,
    };
  }
  const roundedUser = roundOneDecimal(parsed);
  const isCorrect = Math.abs(roundedUser - expectedRounded) < 1e-9;
  return {
    valid: true,
    parsedValue: parsed,
    roundedUser,
    expectedRounded,
    isCorrect,
  };
}

/**
 * Core Physics Model for Soal Nomor 6 (Inclined Plane of Fixed Horizontal Base l with Friction mu)
 */
export function computeSlopeLength(baseLength: number, angleDeg: number): number {
  const rad = toRadians(angleDeg);
  return baseLength / Math.cos(rad);
}

export function computeInclineHeight(baseLength: number, angleDeg: number): number {
  const rad = toRadians(angleDeg);
  return baseLength * Math.tan(rad);
}

export function computeInclineAcceleration(
  angleDeg: number,
  mu: number,
  g = 9.8
): number {
  const rad = toRadians(angleDeg);
  return g * (Math.sin(rad) - mu * Math.cos(rad));
}

export function computeDescentTime(
  baseLength: number,
  angleDeg: number,
  mu: number,
  g = 9.8
): number {
  const rad = toRadians(angleDeg);
  const denom = Math.cos(rad) * (Math.sin(rad) - mu * Math.cos(rad));
  if (denom <= 0) return Infinity;
  return Math.sqrt((2 * baseLength) / (g * denom));
}

export function computeOptimalAngle(mu: number): number {
  return 45 + 0.5 * toDegrees(Math.atan(mu));
}

export function computeMinDescentTime(
  baseLength: number,
  mu: number,
  g = 9.8
): number {
  const factor = Math.sqrt(1 + mu * mu) + mu;
  return Math.sqrt((4 * baseLength * factor) / g);
}

export function computeBottomSpeed(
  baseLength: number,
  angleDeg: number,
  mu: number,
  g = 9.8
): number {
  const rad = toRadians(angleDeg);
  const diff = Math.tan(rad) - mu;
  if (diff <= 0) return 0;
  return Math.sqrt(2 * g * baseLength * diff);
}

export function computeConjugateAngle(angle1Deg: number, mu: number): number {
  const phi = toDegrees(Math.atan(mu));
  return 90 + phi - angle1Deg;
}

export function computeEffectiveMuOpposing(mu: number, kappa: number): number {
  // Horizontal force / pseudo-force opposing horizontal motion & increasing Normal force
  return (mu + kappa) / (1 - mu * kappa);
}

export function computeEffectiveMuAssisting(mu: number, kappa: number): number {
  // Horizontal force / pseudo-force assisting horizontal motion & decreasing Normal force
  return (mu - kappa) / (1 + mu * kappa);
}

export function computeSphereSlipThresholdAngle(mu: number): number {
  return toDegrees(Math.atan(3.5 * mu));
}

export function computeSphereDescentTime(
  baseLength: number,
  angleDeg: number,
  mu: number,
  g = 9.8
): { time: number; isSlipping: boolean } {
  const rad = toRadians(angleDeg);
  const slipThreshold = Math.atan(3.5 * mu);
  if (rad <= slipThreshold + 1e-12) {
    // Pure rolling without slipping: a = (5/7) g sin(alpha)
    const accel = (5 / 7) * g * Math.sin(rad);
    const s = baseLength / Math.cos(rad);
    return {
      time: Math.sqrt((2 * s) / accel),
      isSlipping: false,
    };
  }
  // Rolling with kinetic slipping: a_cm = g (sin(alpha) - mu cos(alpha))
  return {
    time: computeDescentTime(baseLength, angleDeg, mu, g),
    isSlipping: true,
  };
}

export function computeSphereOptimalAngle(
  baseLength: number,
  mu: number,
  g = 9.8
): { optimalAngleDeg: number; regime: 'pure-rolling' | 'slipping' } {
  const slipAngleDeg = computeSphereSlipThresholdAngle(mu);
  const rollingCandidate = Math.min(45, slipAngleDeg);
  const tRoll = computeSphereDescentTime(baseLength, rollingCandidate, mu, g).time;

  const slipCandidate = computeOptimalAngle(mu);
  let bestSlipAngle = slipCandidate;
  if (slipCandidate <= slipAngleDeg) {
    bestSlipAngle = slipAngleDeg + 0.01;
  }
  const tSlip = computeSphereDescentTime(baseLength, bestSlipAngle, mu, g).time;

  if (tSlip < tRoll) {
    return { optimalAngleDeg: bestSlipAngle, regime: 'slipping' };
  }
  return { optimalAngleDeg: rollingCandidate, regime: 'pure-rolling' };
}

export function computeMaxHorizontalExitSpeed(
  baseLength: number,
  mu: number,
  g = 9.8
): number {
  const optAngle = computeOptimalAngle(mu);
  const vBottom = computeBottomSpeed(baseLength, optAngle, mu, g);
  return vBottom * Math.cos(toRadians(optAngle));
}

export function computeOptimalAngleTiltedTarget(psiDeg: number, mu: number): number {
  const phi = toDegrees(Math.atan(mu));
  return 90 - 0.5 * psiDeg + 0.5 * phi;
}

export function computeInclinePlusFloorTotalTime(
  baseLength: number,
  mu: number,
  g = 9.8
): { tIncline: number; tFloor: number; tTotal: number; vBottom: number } {
  const optAngle = computeOptimalAngle(mu);
  const tIncline = computeMinDescentTime(baseLength, mu, g);
  const vBottom = computeBottomSpeed(baseLength, optAngle, mu, g);
  const tFloor = vBottom / (mu * g);
  return {
    tIncline,
    tFloor,
    tTotal: tIncline + tFloor,
    vBottom,
  };
}

/**
 * Analytical exact answers for all 15 problems (unrounded & rounded to 1 decimal)
 */
export function solveProblemExact(problemNumber: number): number {
  switch (problemNumber) {
    case 1: {
      // alpha = 37 deg (sin=0.6, cos=0.8), mu = 0.31, g = 9.8 -> a = 9.8*(0.6 - 0.31*0.8) = 3.4496 -> 3.4
      return 9.8 * (0.6 - 0.31 * 0.8);
    }
    case 2: {
      // l = 2.1 m, alpha = 53 deg (sin=0.8, cos=0.6), mu = 0.31, g = 9.8
      const s = 2.1 / 0.6;
      const a = 9.8 * (0.8 - 0.31 * 0.6);
      return Math.sqrt((2 * s) / a);
    }
    case 3: {
      // l = 2.4 m, h = 1.8 m, mu = 0.25, g = 10 -> v = sqrt(2*10*(1.8 - 0.25*2.4))
      return Math.sqrt(2 * 10 * (1.8 - 0.25 * 2.4));
    }
    case 4: {
      // l = 3.0 m, mu_s = 0.50, mu_k = 0.30, g = 9.8 -> v = sqrt(2*9.8*3.0*(0.50 - 0.30))
      return Math.sqrt(2 * 9.8 * 3.0 * (0.5 - 0.3));
    }
    case 5: {
      // Original OSK No. 6: l = 2.1 m, mu = 0.31 -> alpha_opt
      return computeOptimalAngle(0.31);
    }
    case 6: {
      // t_min for l = 4.0 m, mu = 0.45, g = 9.8
      return computeMinDescentTime(4.0, 0.45, 9.8);
    }
    case 7: {
      // Conjugate angle for mu = 0.31, alpha1 = 38.0 deg
      return computeConjugateAngle(38.0, 0.31);
    }
    case 8: {
      // Assisting horizontal wind F = 0.20 mg, mu = 0.50
      const muEff = computeEffectiveMuAssisting(0.5, 0.2);
      return computeOptimalAngle(muEff);
    }
    case 9: {
      // alpha1 = 37 (sin=0.6, cos=0.8), alpha2 = 53 (sin=0.8, cos=0.6), (t1/t2)^2 = 1.5
      // (0.48 - 0.36 mu) / (0.48 - 0.64 mu) = 1.5 -> mu = 0.4
      const r = 1.5;
      return (0.48 * (r - 1)) / (0.64 * r - 0.36);
    }
    case 10: {
      // Train accelerating right a_k = 0.20 g, mu = 0.40 -> pseudo-force left (opposing)
      const muEff = computeEffectiveMuOpposing(0.4, 0.2);
      return computeOptimalAngle(muEff);
    }
    case 11: {
      // Solid sphere (I = 2/5 mR^2), l = 2.8 m, mu = 0.25
      return computeSphereOptimalAngle(2.8, 0.25, 9.8).optimalAngleDeg;
    }
    case 12: {
      // Max horizontal exit speed: l = 4.5 m, mu = 0.75, g = 9.8
      return computeMaxHorizontalExitSpeed(4.5, 0.75, 9.8);
    }
    case 13: {
      // Cart sliding down rough slope (mu_k = 0.20), internal ramp friction mu_A = 0.60
      // Effective assisting ratio is mu_k = 0.20 -> mu_eff = (mu_A - mu_k)/(1 + mu_A*mu_k)
      const muEff = computeEffectiveMuAssisting(0.6, 0.2);
      return computeOptimalAngle(muEff);
    }
    case 14: {
      // Tilted target wall psi = 60 deg, mu = 0.40
      return computeOptimalAngleTiltedTarget(60, 0.4);
    }
    case 15: {
      // Optimal incline l = 3.0 m, mu = 0.40, g = 10 + flat floor stopping (mu = 0.40)
      return computeInclinePlusFloorTotalTime(3.0, 0.4, 10).tTotal;
    }
    default:
      throw new Error(`Unknown problem number: ${problemNumber}`);
  }
}

/**
 * Numerical time-stepping kinematics simulation (Verlet / RK2) for animation & verification
 */
export interface MotionState {
  t: number;
  s: number;
  v: number;
  a: number;
  x: number;
  y: number;
  finished: boolean;
}

export function simulateInclineStep(
  state: MotionState,
  dt: number,
  angleDeg: number,
  mu: number,
  baseLength: number,
  g = 9.8,
  aOverride?: number
): MotionState {
  if (state.finished) return state;
  const rad = toRadians(angleDeg);
  const sMax = baseLength / Math.cos(rad);
  const a = aOverride !== undefined ? aOverride : computeInclineAcceleration(angleDeg, mu, g);

  if (a <= 0 && state.v <= 0) {
    return {
      ...state,
      a: 0,
      v: 0,
      finished: false,
    };
  }

  let nextV = state.v + a * dt;
  let nextS = state.s + state.v * dt + 0.5 * a * dt * dt;
  let nextT = state.t + dt;
  let finished = false;

  if (nextS >= sMax) {
    // Interpolate exact hit time inside step
    const remaining = sMax - state.s;
    const disc = state.v * state.v + 2 * a * remaining;
    const dtExact = a > 1e-9 ? (-state.v + Math.sqrt(Math.max(0, disc))) / a : remaining / Math.max(1e-6, state.v);
    nextS = sMax;
    nextV = state.v + a * dtExact;
    nextT = state.t + dtExact;
    finished = true;
  }

  return {
    t: nextT,
    s: nextS,
    v: nextV,
    a,
    x: nextS * Math.cos(rad),
    y: nextS * Math.sin(rad),
    finished,
  };
}
