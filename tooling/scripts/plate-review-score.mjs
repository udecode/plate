#!/usr/bin/env node

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const architectureAxes = Object.freeze([
  Object.freeze({ key: 'owner', weight: 2 }),
  Object.freeze({ key: 'lifetime', weight: 2 }),
  Object.freeze({ key: 'boundary', weight: 1 }),
  Object.freeze({ key: 'api', weight: 1.5 }),
  Object.freeze({ key: 'scale', weight: 1.5 }),
  Object.freeze({ key: 'correctness', weight: 1 }),
  Object.freeze({ key: 'proof', weight: 1 }),
]);

export const confidenceDimensions = Object.freeze([
  Object.freeze({ key: 'inventory', weight: 35 }),
  Object.freeze({ key: 'trace', weight: 30 }),
  Object.freeze({ key: 'consumers', weight: 20 }),
  Object.freeze({ key: 'runtime', weight: 15 }),
]);

export const architectureCaps = Object.freeze([
  Object.freeze({ ceiling: 2, key: 'wrong-owner', status: 'final' }),
  Object.freeze({ ceiling: 2, key: 'duplicate-truth', status: 'final' }),
  Object.freeze({ ceiling: 3, key: 'wrong-lifetime', status: 'final' }),
  Object.freeze({
    ceiling: 5,
    key: 'reachability-contradiction',
    status: 'final',
  }),
  Object.freeze({ ceiling: 6, key: 'unmeasured-scale', status: 'provisional' }),
  Object.freeze({ ceiling: 1, key: 'correctness-blocker', status: 'blocker' }),
  Object.freeze({
    ceiling: null,
    key: 'incomplete-manifest',
    status: 'incomplete',
  }),
]);

const round = (value, digits) => {
  const factor = 10 ** digits;

  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const validateGrades = (grades, dimensions, label) => {
  if (!grades || typeof grades !== 'object' || Array.isArray(grades)) {
    throw new Error(`${label} grades must be an object`);
  }

  const expected = new Set(dimensions.map(({ key }) => key));
  const actual = Object.keys(grades);
  const missing = [...expected].filter((key) => !Object.hasOwn(grades, key));
  const unknown = actual.filter((key) => !expected.has(key));

  if (missing.length > 0) {
    throw new Error(`Missing ${label} grades: ${missing.join(', ')}`);
  }
  if (unknown.length > 0) {
    throw new Error(`Unknown ${label} grades: ${unknown.join(', ')}`);
  }

  for (const key of actual) {
    const grade = grades[key];

    if (!Number.isInteger(grade) || grade < 0 || grade > 4) {
      throw new Error(`${label} grade ${key} must be an integer from 0 to 4`);
    }
  }
};

const resolveCaps = (caps) => {
  if (!Array.isArray(caps)) {
    throw new Error('caps must be an array');
  }

  const unique = new Set(caps);
  if (unique.size !== caps.length) {
    throw new Error('caps must not contain duplicates');
  }

  const known = new Set(architectureCaps.map(({ key }) => key));
  const unknown = caps.filter((key) => !known.has(key));
  if (unknown.length > 0) {
    throw new Error(`Unknown caps: ${unknown.join(', ')}`);
  }

  return architectureCaps.filter(({ key }) => unique.has(key));
};

export const scoreArchitecture = ({ axes, caps = [], confidence }) => {
  validateGrades(axes, architectureAxes, 'architecture');
  validateGrades(confidence, confidenceDimensions, 'confidence');

  const appliedCaps = resolveCaps(caps);
  const axisPoints = Object.fromEntries(
    architectureAxes.map(({ key, weight }) => [
      key,
      {
        grade: axes[key],
        points: round((axes[key] / 4) * weight, 3),
        weight,
      },
    ])
  );
  const rawScore = round(
    Object.values(axisPoints).reduce((sum, { points }) => sum + points, 0),
    1
  );
  const boundedScore = round(
    Math.min(
      rawScore,
      ...appliedCaps
        .map(({ ceiling }) => ceiling)
        .filter((ceiling) => ceiling !== null)
    ),
    1
  );
  const confidenceScore = Math.round(
    confidenceDimensions.reduce(
      (sum, { key, weight }) => sum + (confidence[key] / 4) * weight,
      0
    )
  );
  const confidencePoints = Object.fromEntries(
    confidenceDimensions.map(({ key, weight }) => [
      key,
      {
        grade: confidence[key],
        points: round((confidence[key] / 4) * weight, 3),
        weight,
      },
    ])
  );
  const hasStatus = (status) =>
    appliedCaps.some((cap) => cap.status === status);
  const status = hasStatus('incomplete')
    ? 'incomplete'
    : hasStatus('blocker')
      ? 'blocker'
      : hasStatus('provisional')
        ? 'provisional'
        : 'final';
  const scoreCeiling = status === 'incomplete' ? null : boundedScore;
  const finalScore = ['incomplete', 'provisional'].includes(status)
    ? null
    : boundedScore;
  const displayScore =
    status === 'incomplete'
      ? 'incomplete (no numeric score)'
      : status === 'provisional'
        ? `≤${boundedScore.toFixed(1)}/10 (provisional)`
        : status === 'blocker'
          ? `${boundedScore.toFixed(1)}/10 (blocker)`
          : `${boundedScore.toFixed(1)}/10`;

  return {
    appliedCaps,
    axisPoints,
    confidence: confidenceScore,
    confidencePoints,
    displayScore,
    finalScore,
    rawScore,
    schemaVersion: 1,
    scoreCeiling,
    status,
  };
};

const parseAssignment = (value, flag) => {
  const separator = value.indexOf('=');
  if (separator < 1 || separator === value.length - 1) {
    throw new Error(`${flag} expects <key>=<grade>`);
  }

  return [value.slice(0, separator), Number(value.slice(separator + 1))];
};

export const parseScoreArguments = (arguments_) => {
  const axes = {};
  const caps = [];
  const confidence = {};

  for (let index = 0; index < arguments_.length; index += 1) {
    const flag = arguments_[index];
    const value = arguments_[index + 1];

    if (flag === '--help') return { help: true };
    if (!['--axis', '--cap', '--confidence'].includes(flag)) {
      throw new Error(`Unknown argument: ${flag}`);
    }
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`${flag} requires a value`);
    }

    if (flag === '--cap') {
      caps.push(value);
    } else {
      const [key, grade] = parseAssignment(value, flag);
      const target = flag === '--axis' ? axes : confidence;
      if (Object.hasOwn(target, key)) {
        throw new Error(`${flag} repeats ${key}`);
      }
      target[key] = grade;
    }
    index += 1;
  }

  return { axes, caps, confidence };
};

const help = `Usage:
  node tooling/scripts/plate-review-score.mjs \\
    --axis <key=grade>... \\
    --confidence <key=grade>... \\
    [--cap <key>]...

Grades are integers from 0 through 4. Every architecture and confidence key is required.`;

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  try {
    const parsed = parseScoreArguments(process.argv.slice(2));

    if (parsed.help) {
      process.stdout.write(`${help}\n`);
    } else {
      process.stdout.write(
        `${JSON.stringify(scoreArchitecture(parsed), null, 2)}\n`
      );
    }
  } catch (error) {
    process.stderr.write(`plate-review-score: ${error.message}\n`);
    process.exitCode = 1;
  }
}
