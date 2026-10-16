#!/usr/bin/env node
// Judges whether a workflow trial's frozen keep rule can tell its arms apart
// before any arm runs, and judges the trial's result under that rule after.
//
// Usage:
//   node tooling/scripts/trial-power.mjs <spec.json>
//   node tooling/scripts/trial-power.mjs <spec.json> --analyze <scores.json> --frozen <digest>
// Exit: 0 the spec passes, or the result keeps the candidate; 1 the helper
// refuses the spec, or the result drops the candidate; 3 the result is
// inconclusive; 2 any error, such as a malformed spec or a changed freeze.
//
// Spec:
//   {
//     "incumbent": "A",
//     "candidate": "B",
//     "alternatives": ["C"],
//     "cases": 80,
//     "casesPerSession": 1,
//     "pilot": { "caught": 6, "cases": 8, "grader": "gpt-6-astra" },
//     "grader": "gpt-6-astra",
//     "gain": 0.2,
//     "keep": { "overIncumbent": 11, "overAlternatives": 2 },
//     "dryGrade": "dry-grade.tsv"
//   }
// `alternatives` defaults to none and `casesPerSession` to 1. Each arm answers
// each case in its own session; answers that share a session are correlated,
// so the helper refuses a spec with more than one case per session.
// `pilot` is the incumbent's run on pilot cases: `caught` of `cases`, graded
// by `pilot.grader`, which must be the trial's `grader`. `gain` is the rise in
// catch rate the change claims for the candidate. The candidate is kept when it
// catches at least `overIncumbent` more cases than the incumbent and
// `overAlternatives` more than each alternative.
// `dryGrade`, relative to the spec, is the trial grader's verdict on two
// reference answers per trial case and arm: the right answer under that arm's
// version, and the same answer with only its call changed. Each line is
// `<case>\t<arm>\t<right: pass|fail>\t<flipped: pass|fail>`; the trial needs
// one line per case and arm, every right answer passing and every flipped one
// failing.
// The false-keep and power checks hold for any way the arms' answers on one
// case relate, and assume each trial case is an independent random draw from
// the cases the claim is about; nothing here checks how the cases were chosen.
// On the cases where the candidate and the incumbent differ, a candidate no
// better than the incumbent wins each one at most half the time, so its chance
// of clearing `overIncumbent` is at most the largest such tail over every
// number of differing cases; the rule passes when that is at most one in five.
// Power is a floor on the chance of a keep when the candidate gains `gain`
// and the alternatives do not improve: the smallest chance of clearing
// `overIncumbent` over every share of differing cases that an incumbent rate
// in the pilot's 80% Wilson interval, up to 1 - gain, allows, less each
// alternative's worst chance of missing `overAlternatives`. The rule passes
// when power is at least two in three. On a passing spec each smallest chance
// is a proven lower bound within 0.002 of the true one. A refused spec's search
// can stop at the first share that falls short, so its printed power is not a
// bound and means only that two in three cannot be shown. Nothing bounds how
// often a candidate no better than an alternative clears `overAlternatives`.
// A run without --analyze prints the spec's digest, a hash of the spec and dry
// grade files' text, whether or not the spec passes. --analyze checks the
// digest the lead logged at the freeze against the files it reads.
//
// Scores: { "A": 40, "B": 51, "C": 46 }, each arm's total cases caught.
// --analyze calls a result inconclusive when the spec does not pass, when the
// incumbent or an alternative scored too high for any keep, or when the
// incumbent and the candidate both caught nothing.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MIN_POWER = 2 / 3;
const MAX_FALSE_KEEP = 1 / 5;
const WILSON_Z = 1.2816;
const POWER_TOLERANCE = 0.002;

class SpecError extends Error {
  name = 'SpecError';
}

function assertSpec(condition, message) {
  if (!condition) throw new SpecError(message);
}

const isCount = (value, min) => Number.isInteger(value) && value >= min;

function binomialPmf(trials, rate) {
  const pmf = new Array(trials + 1).fill(0);
  if (rate <= 0) pmf[0] = 1;
  else if (rate >= 1) pmf[trials] = 1;
  else {
    let logChoose = 0;
    for (let hits = 0; hits <= trials; hits++) {
      if (hits > 0) logChoose += Math.log((trials - hits + 1) / hits);
      pmf[hits] = Math.exp(
        logChoose + hits * Math.log(rate) + (trials - hits) * Math.log1p(-rate)
      );
    }
  }
  return pmf;
}

function atLeast(pmf, hits) {
  let sum = 0;
  for (let i = Math.max(0, hits); i < pmf.length; i++) sum += pmf[i];
  return sum;
}

const winsForLead = (disagreements, margin) =>
  Math.ceil((disagreements + margin) / 2);

const leadAtLeast = (disagreements, winRate, margin) =>
  atLeast(
    binomialPmf(disagreements, winRate),
    winsForLead(disagreements, margin)
  );

function pairedKeepRate(cases, disagreeRate, gain, margin) {
  const winRate = (disagreeRate + gain) / (2 * disagreeRate);
  const rate = binomialPmf(cases, disagreeRate).reduce(
    (sum, p, disagreements) =>
      sum + p * leadAtLeast(disagreements, winRate, margin),
    0
  );
  if (!Number.isFinite(rate)) {
    throw new Error(
      `keep rate is not finite at disagreement rate ${disagreeRate}`
    );
  }
  return rate;
}

function worstPairedKeepRate(cases, mostDisagreement, gain, margin, stopBelow) {
  const keepRate = (disagreeRate) =>
    pairedKeepRate(cases, disagreeRate, gain, margin);
  const maxKeepRateSlope = cases / 2;
  const spanFloor = ([a, atA, b, atB]) =>
    Math.max(0, (atA + atB - maxKeepRateSlope * (b - a)) / 2);
  const spans = [
    [gain, keepRate(gain), mostDisagreement, keepRate(mostDisagreement)],
  ];
  let leastSeen = Math.min(spans[0][1], spans[0][3]);
  let settledFloor = Infinity;
  while (spans.length > 0 && leastSeen >= stopBelow) {
    const span = spans.pop();
    if (spanFloor(span) >= leastSeen - POWER_TOLERANCE) {
      settledFloor = Math.min(settledFloor, spanFloor(span));
      continue;
    }
    const [a, atA, b, atB] = span;
    const middle = (a + b) / 2;
    const atMiddle = keepRate(middle);
    leastSeen = Math.min(leastSeen, atMiddle);
    spans.push([a, atA, middle, atMiddle], [middle, atMiddle, b, atB]);
  }
  return Math.min(settledFloor, leastSeen);
}

function wilsonInterval(caught, cases) {
  const rate = caught / cases;
  const z2 = WILSON_Z ** 2;
  const center = (rate + z2 / (2 * cases)) / (1 + z2 / cases);
  const half =
    (WILSON_Z *
      Math.sqrt((rate * (1 - rate)) / cases + z2 / (4 * cases ** 2))) /
    (1 + z2 / cases);
  return [Math.max(0, center - half), Math.min(1, center + half)];
}

function readSpec(specPath) {
  const specText = readFileSync(specPath, 'utf-8');
  const spec = JSON.parse(specText);
  assertSpec(
    spec && typeof spec === 'object' && !Array.isArray(spec),
    'spec must be a JSON object'
  );
  spec.alternatives ??= [];
  spec.casesPerSession ??= 1;
  assertSpec(
    typeof spec.incumbent === 'string' && typeof spec.candidate === 'string',
    'spec needs incumbent and candidate arm names'
  );
  assertSpec(
    Array.isArray(spec.alternatives) &&
      spec.alternatives.every((arm) => typeof arm === 'string'),
    'alternatives must be a list of arm names'
  );
  assertSpec(
    new Set([spec.incumbent, spec.candidate, ...spec.alternatives]).size ===
      spec.alternatives.length + 2,
    'arm names must differ'
  );
  assertSpec(
    isCount(spec.cases, 1) && isCount(spec.casesPerSession, 1),
    'cases and casesPerSession must be positive integers'
  );
  const { pilot } = spec;
  assertSpec(
    pilot &&
      isCount(pilot.cases, 1) &&
      isCount(pilot.caught, 0) &&
      pilot.caught <= pilot.cases,
    'pilot needs caught and cases counts, caught at most cases'
  );
  assertSpec(
    typeof spec.grader === 'string' && typeof pilot.grader === 'string',
    'spec and pilot each name their grader'
  );
  assertSpec(
    typeof spec.gain === 'number' && spec.gain > 0 && spec.gain < 1,
    'gain must be a rate above 0 and below 1'
  );
  assertSpec(
    isCount(spec.keep?.overIncumbent, 0) &&
      isCount(spec.keep?.overAlternatives, 0),
    'keep needs overIncumbent and overAlternatives counts'
  );
  assertSpec(typeof spec.dryGrade === 'string', 'spec needs a dryGrade file');
  const dryGradeText = readFileSync(
    path.resolve(path.dirname(specPath), spec.dryGrade),
    'utf-8'
  );
  spec.dryGradeLines = dryGradeText
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const [id, arm, right, flipped] = line
        .split('\t')
        .map((cell) => cell.trim());
      return { id, arm, right, flipped };
    });
  spec.digest = createHash('sha256')
    .update(specText)
    .update('\0')
    .update(dryGradeText)
    .digest('hex')
    .slice(0, 16);
  return spec;
}

function judgeSpec(spec) {
  const refusals = [];
  const pilotRate = spec.pilot.caught / spec.pilot.cases;
  if (spec.casesPerSession > 1) {
    refusals.push(
      `${spec.casesPerSession} cases share each session, so their answers are correlated: run each case in its own session`
    );
  }
  if (spec.pilot.grader !== spec.grader) {
    refusals.push(
      `the pilot was graded by ${spec.pilot.grader} and the trial by ${spec.grader}; one grader grades both`
    );
  }
  if (spec.pilot.caught === 0) {
    refusals.push(
      'the incumbent caught no pilot case, so the key may hold nothing an arm can reach'
    );
  }
  if (pilotRate + spec.gain > 1) {
    refusals.push(
      `the incumbent already catches ${pilotRate.toFixed(2)}, so a gain of ${spec.gain} cannot happen`
    );
  }
  const arms = [spec.incumbent, spec.candidate, ...spec.alternatives];
  const pairs = new Set(
    spec.dryGradeLines.map(({ id, arm }) => `${id}\t${arm}`)
  );
  const ids = new Set(spec.dryGradeLines.map(({ id }) => id));
  if (
    spec.dryGradeLines.length !== spec.cases * arms.length ||
    pairs.size !== spec.dryGradeLines.length ||
    ids.size !== spec.cases ||
    !spec.dryGradeLines.every(({ arm }) => arms.includes(arm))
  ) {
    refusals.push(
      `the dry grade needs one line for each of the ${spec.cases} trial cases and each of the arms ${arms.join(', ')}`
    );
  }
  const docked = spec.dryGradeLines
    .filter(({ right }) => right !== 'pass')
    .map(({ id, arm }) => `${id} for ${arm}`);
  if (docked.length > 0) {
    refusals.push(
      `the key docks a right answer on ${docked.join(', ')}, so it scores more than the call`
    );
  }
  const lenient = spec.dryGradeLines
    .filter(({ flipped }) => flipped !== 'fail')
    .map(({ id, arm }) => `${id} for ${arm}`);
  if (lenient.length > 0) {
    refusals.push(
      `the key does not fail the answer with its call flipped on ${lenient.join(', ')}`
    );
  }
  if (refusals.length > 0) return { refusals };
  const [low, high] = wilsonInterval(spec.pilot.caught, spec.pilot.cases);
  const top = Math.min(high, 1 - spec.gain);
  const peakIncumbentRate = Math.min(Math.max((1 - spec.gain) / 2, low), top);
  const mostDisagreement =
    spec.gain +
    2 * Math.min(peakIncumbentRate, 1 - peakIncumbentRate - spec.gain);
  const overIncumbent = worstPairedKeepRate(
    spec.cases,
    mostDisagreement,
    spec.gain,
    spec.keep.overIncumbent,
    MIN_POWER
  );
  const alternatives = spec.alternatives.length;
  let power = overIncumbent;
  if (alternatives > 0 && overIncumbent >= MIN_POWER) {
    const stopBelow = 1 - (overIncumbent - MIN_POWER) / alternatives;
    const overAlternative = worstPairedKeepRate(
      spec.cases,
      mostDisagreement,
      spec.gain,
      spec.keep.overAlternatives,
      stopBelow
    );
    power = Math.max(0, overIncumbent - alternatives * (1 - overAlternative));
  }
  const falseKeep = Math.max(
    ...Array.from({ length: spec.cases + 1 }, (_, disagreements) =>
      leadAtLeast(disagreements, 0.5, spec.keep.overIncumbent)
    )
  );
  if (power < MIN_POWER) {
    refusals.push(
      `the rule's power cannot be shown to reach two in three (search result ${power.toFixed(3)})`
    );
  }
  if (falseKeep > MAX_FALSE_KEEP) {
    refusals.push(
      `the rule keeps a candidate no better than the incumbent up to ${falseKeep.toFixed(3)} of the time, above one in five`
    );
  }
  return { power, falseKeep, refusals };
}

function judgeScores(spec, scores) {
  assertSpec(
    scores && typeof scores === 'object',
    'scores must be a JSON object'
  );
  const arms = [spec.incumbent, spec.candidate, ...spec.alternatives];
  for (const arm of arms) {
    assertSpec(
      isCount(scores[arm], 0) && scores[arm] <= spec.cases,
      `score for ${arm} must be a count from 0 to ${spec.cases}`
    );
  }
  if (judgeSpec(spec).refusals.length > 0) {
    return {
      verdict: 'inconclusive',
      reason: 'the spec does not pass, so the rule cannot tell the arms apart',
    };
  }
  const incumbent = scores[spec.incumbent];
  const candidate = scores[spec.candidate];
  const ceilinged = [
    [spec.incumbent, spec.keep.overIncumbent],
    ...spec.alternatives.map((arm) => [arm, spec.keep.overAlternatives]),
  ].find(([arm, margin]) => scores[arm] + margin > spec.cases);
  if (ceilinged) {
    return {
      verdict: 'inconclusive',
      reason: `${ceilinged[0]} scored too high for any keep`,
    };
  }
  if (incumbent === 0 && candidate === 0) {
    return {
      verdict: 'inconclusive',
      reason: `${spec.incumbent} and ${spec.candidate} both caught nothing`,
    };
  }
  const kept =
    candidate >= incumbent + spec.keep.overIncumbent &&
    spec.alternatives.every(
      (arm) => candidate >= scores[arm] + spec.keep.overAlternatives
    );
  return kept
    ? { verdict: 'keep', reason: `${spec.candidate} clears every margin` }
    : {
        verdict: 'drop',
        reason: `${spec.candidate} misses a margin, so ${spec.incumbent} stays`,
      };
}

function main(args) {
  const [specPath, ...rest] = args;
  const analyze =
    rest.length === 4 && rest[0] === '--analyze' && rest[2] === '--frozen';
  if (!specPath || (rest.length > 0 && !analyze)) {
    throw new SpecError(
      'usage: trial-power.mjs <spec.json> [--analyze <scores.json> --frozen <digest>]'
    );
  }
  const spec = readSpec(specPath);
  if (analyze) {
    assertSpec(
      rest[3] === spec.digest,
      `the spec or dry grade changed since the freeze, so its digest is not ${rest[3]}`
    );
    const { verdict, reason } = judgeScores(
      spec,
      JSON.parse(readFileSync(rest[1], 'utf-8'))
    );
    console.log(`${verdict}: ${reason}`);
    return { keep: 0, drop: 1, inconclusive: 3 }[verdict];
  }
  const { power, falseKeep, refusals } = judgeSpec(spec);
  if (power !== undefined) {
    console.log(
      `power ${power.toFixed(3)}, worst false keep ${falseKeep.toFixed(3)}, for a gain of ${spec.gain} over ${spec.cases} cases`
    );
  }
  for (const refusal of refusals) console.log(`refused: ${refusal}`);
  console.log(`digest ${spec.digest}`);
  if (refusals.length > 0) return 1;
  console.log('ok: the rule can tell the arms apart');
  return 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof SpecError ? `error: ${error.message}` : error);
  process.exitCode = 2;
}
