#!/usr/bin/env node
// Runs paired timing arms in mirrored packet pairs and judges one frozen ratio
// line per cohort. A cohort is inconclusive when a planted arm does not exceed
// the budget by more than the same-code noise, or when that noise reaches the
// candidate's distance to the budget. The run is inconclusive when the
// one-minute load goes above loadLimit; otherwise it fails when the candidate
// misses any conclusive cohort, and passes only when every cohort is
// conclusive and passes.
//
// Usage:
//   node paired-timing.mjs <config.json> <measurements.json>
//   node paired-timing.mjs <config.json> --analyze <measurements.json> [--replay]
// Exit: 0 the candidate passes, 1 it fails, 3 inconclusive or any --replay, 2 any error, such as a bad config or a failed arm.
//
// Config:
//   {
//     "metric": "medianMicrosPerUpdate",
//     "budget": 1.05,
//     "loadLimit": 6,
//     "cohorts": ["normal", "large"],
//     "arms": { "base": { "cwd": "...", "command": ["bun", "bench.ts"], "source": "/wt-base/" }, "candidate": {...}, ... },
//     "planted": { "<arm>": ["<cohort>", ...] },
//     "sameCode": { "<arm>": ["<cohort>", ...] }
//   }
// `budget` is one ratio for every cohort, or an object with one for each cohort.
// Every run has six packets, three mirrored pairs. Every cohort needs a
// planted arm and a same-code arm. No arm is both, and base and candidate are
// neither. Planted arms carry a deliberate slowdown on their cohorts.
// Same-code arms run the candidate's code on their cohorts, such as a second
// copy of the candidate.
// Each arm's cwd resolves against the config file's directory, which is also
// its default. Each arm's command prints JSON on its last stdout line with an
// optional `label`, `loaded`, the files it ran, each path containing the arm's
// `source`, and `results: [{ cohort, <metric> }]` for exactly the config's
// cohorts, each metric finite and positive.
//
// Measuring refuses a measurements path that already exists. The runner saves
// each run, with its label and loaded files, before it checks that run; an arm
// that exits nonzero stops the run and keeps the runs before it. The saved file
// records the config, and --analyze refuses a file measured under another
// config unless --replay is passed; a replay only prints the verdict under the
// config passed.
//
// Packets run the arms in config.arms order, reversed on odd packets. Each
// pair of packets gives an arm one ratio per cohort, the geometric mean of its
// two ratios over base, which cancels steadily compounding drift exactly and
// linear drift to first order. An arm's statistic is the median of its three
// pair ratios. A same-code arm's noise is the larger of two gaps to the
// candidate: between their statistics, and the median over pairs of the gap
// between their pair ratios. A cohort's noise is the largest across its
// same-code arms.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus, loadavg } from 'node:os';
import path from 'node:path';

const fail = (message) => {
  throw new Error(message);
};

const isPositive = (value) => Number.isFinite(value) && value > 0;

const PACKETS = 6;

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const readConfig = (configPath) => {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const stamp = structuredClone(config);
  const base = path.dirname(path.resolve(configPath));
  const { arms, budget, cohorts, loadLimit, metric, planted, sameCode } = config;

  if (typeof metric !== 'string') fail('config.metric must name the measured field');
  if (!isPositive(loadLimit)) fail('config.loadLimit must be a positive one-minute load');
  if (!Array.isArray(cohorts) || cohorts.length === 0 || new Set(cohorts).size !== cohorts.length) {
    fail('config.cohorts must list each judged cohort once');
  }
  const budgets = typeof budget === 'number' ? Object.fromEntries(cohorts.map((cohort) => [cohort, budget])) : (budget ?? {});
  for (const cohort of cohorts) {
    if (!isPositive(budgets[cohort])) {
      fail(typeof budget === 'number' ? 'config.budget must be a positive ratio' : `config.budget.${cohort} must be a positive ratio`);
    }
  }
  config.budgets = budgets;
  if (!arms?.base || !arms?.candidate) fail('config.arms needs a base and a candidate');
  for (const [name, arm] of Object.entries(arms)) {
    if (!Array.isArray(arm.command) || arm.command.length === 0) fail(`config.arms.${name}.command must be an argv array`);
    if (typeof arm.source !== 'string' || arm.source === '') {
      fail(`config.arms.${name}.source must be text that every file the arm runs contains`);
    }
    arm.cwd = path.resolve(base, arm.cwd ?? '.');
  }

  const coverage = (name, group, reason) => {
    const covered = new Set();
    for (const [arm, armCohorts] of Object.entries(group ?? {})) {
      if (!arms[arm]) fail(`config.${name} names ${arm}, which config.arms lacks`);
      if (arm === 'base' || arm === 'candidate') fail(`config.${name} cannot use the ${arm} arm`);
      if (!Array.isArray(armCohorts) || armCohorts.length === 0) fail(`config.${name}.${arm} names no cohort`);
      for (const cohort of armCohorts) {
        if (!cohorts.includes(cohort)) fail(`config.${name}.${arm} names ${cohort}, which config.cohorts lacks`);
        covered.add(cohort);
      }
    }
    for (const cohort of cohorts) {
      if (!covered.has(cohort)) fail(`config.${name} has no arm for ${cohort}; ${reason}`);
    }
  };
  coverage('planted', planted, 'a line with no planted slowdown cannot fail');
  coverage('sameCode', sameCode, 'without a same-code arm, the run cannot measure its own noise');
  for (const arm of Object.keys(sameCode)) {
    if (Object.hasOwn(planted, arm)) fail(`${arm} cannot be both a planted arm and a same-code arm`);
  }

  return { config, stamp };
};

const parseLastLine = (stdout) => {
  const line = stdout.trim().split('\n').at(-1) ?? '';
  let value;
  try {
    value = JSON.parse(line);
  } catch {
    value = undefined;
  }
  return value !== null && typeof value === 'object' ? value : { unparsed: line.slice(0, 200) };
};

const measure = (config, stamp, outPath) => {
  if (existsSync(outPath)) fail(`${outPath} exists; write each attempt to a new file`);
  const armOrder = Object.keys(config.arms);
  const measurements = { cores: cpus().length, config: stamp, runs: [] };
  for (let packet = 0; packet < PACKETS; packet++) {
    for (const name of packet % 2 === 0 ? armOrder : [...armOrder].reverse()) {
      const arm = config.arms[name];
      const before = loadavg()[0];
      const stdout = execFileSync(arm.command[0], arm.command.slice(1), {
        cwd: arm.cwd,
        encoding: 'utf8',
        maxBuffer: 1 << 26,
      });
      const after = loadavg()[0];
      const { label, loaded, results, unparsed } = parseLastLine(stdout);
      const run = { arm: name, packet, load: Math.max(before, after), label, loaded, results, unparsed };
      measurements.runs.push(run);
      writeFileSync(outPath, JSON.stringify(measurements, null, 1));
      checkRun(config, run);
    }
  }
  return measurements;
};

const checkRun = (config, run) => {
  if (!Object.hasOwn(config.arms, run.arm)) fail(`a run names ${run.arm}, which config.arms lacks`);
  if (!(Number.isInteger(run.packet) && run.packet >= 0 && run.packet < PACKETS)) {
    fail(`${run.arm} has a run in packet ${run.packet}, outside 0 to ${PACKETS - 1}`);
  }
  if (!Number.isFinite(run.load)) fail(`${run.arm} packet ${run.packet} has no finite load`);
  if (!Array.isArray(run.results)) {
    fail(`${run.arm} packet ${run.packet} printed no JSON line with a results array: ${run.unparsed ?? ''}`);
  }
  const { source } = config.arms[run.arm];
  if (!Array.isArray(run.loaded) || run.loaded.length === 0 || !run.loaded.every((file) => String(file).includes(source))) {
    fail(`${run.arm} packet ${run.packet} ran files outside ${source}: ${JSON.stringify(run.loaded)}`);
  }
  const cohorts = run.results.map((row) => row.cohort);
  if (cohorts.length !== config.cohorts.length || !config.cohorts.every((cohort) => cohorts.includes(cohort))) {
    fail(`${run.arm} packet ${run.packet} reports cohorts ${cohorts.join(', ')}, not ${config.cohorts.join(', ')}`);
  }
  for (const row of run.results) {
    if (!isPositive(row[config.metric])) {
      fail(`${run.arm} packet ${run.packet} has no finite positive ${config.metric} for ${row.cohort}`);
    }
  }
};

const checkMatrix = (config, runs) => {
  for (const run of runs) checkRun(config, run);
  for (const arm of Object.keys(config.arms)) {
    for (let packet = 0; packet < PACKETS; packet++) {
      const count = runs.filter((run) => run.arm === arm && run.packet === packet).length;
      if (count !== 1) fail(`expected one run of ${arm} in packet ${packet}, found ${count}`);
    }
  }
};

const judge = (config, { runs }) => {
  checkMatrix(config, runs);
  const value = (arm, packet, cohort) =>
    runs.find((run) => run.arm === arm && run.packet === packet).results.find((row) => row.cohort === cohort)[config.metric];
  const logRatio = (arm, packet, cohort) => Math.log(value(arm, packet, cohort)) - Math.log(value('base', packet, cohort));
  const pairs = (arm, cohort) =>
    Array.from({ length: PACKETS / 2 }, (_, pair) => {
      const ratio = Math.exp((logRatio(arm, 2 * pair, cohort) + logRatio(arm, 2 * pair + 1, cohort)) / 2);
      if (!isPositive(ratio)) fail(`${arm}'s pair ${pair} ratio on ${cohort} is out of range: ${ratio}`);
      return ratio;
    });
  const armsOn = (group, cohort) => Object.keys(group).filter((arm) => group[arm].includes(cohort));

  const cohorts = config.cohorts.map((cohort) => {
    const rows = Object.keys(config.arms)
      .filter((arm) => arm !== 'base')
      .map((arm) => {
        const armPairs = pairs(arm, cohort);
        return { arm, pairs: armPairs, statistic: median(armPairs) };
      });
    const row = (arm) => rows.find((entry) => entry.arm === arm);
    const candidate = row('candidate');
    const noise = Math.max(
      ...armsOn(config.sameCode, cohort).map((arm) =>
        Math.max(
          Math.abs(row(arm).statistic - candidate.statistic),
          median(row(arm).pairs.map((ratio, pair) => Math.abs(ratio - candidate.pairs[pair])))
        )
      )
    );
    const budget = config.budgets[cohort];
    const margin = Math.abs(budget - candidate.statistic);
    const reasons = [];
    for (const arm of armsOn(config.planted, cohort)) {
      const { statistic } = row(arm);
      if (statistic - budget <= noise) {
        reasons.push(
          `planted ${arm} scored ${statistic.toFixed(3)}, not past the budget ${budget} by more than the same-code noise ${noise.toFixed(3)}, so the line could not fail there`
        );
      }
    }
    if (noise >= margin) {
      reasons.push(`the same-code noise ${noise.toFixed(3)} reaches the candidate's margin ${margin.toFixed(3)} to the budget`);
    }
    return { cohort, rows, noise, reasons, passes: candidate.statistic <= budget };
  });

  const maxLoad = Math.max(...runs.map((run) => run.load));
  const overloaded = maxLoad > config.loadLimit;
  const conclusive = cohorts.filter((entry) => entry.reasons.length === 0);
  const misses = conclusive.filter((entry) => !entry.passes).map((entry) => entry.cohort);
  const status = overloaded ? 'inconclusive' : misses.length > 0 ? 'fail' : conclusive.length === cohorts.length ? 'pass' : 'inconclusive';
  const inconclusive = [
    ...(overloaded ? [`one-minute load reached ${maxLoad.toFixed(2)} > ${config.loadLimit}`] : []),
    ...cohorts.flatMap((entry) => entry.reasons.map((reason) => `${entry.cohort}: ${reason}`)),
  ];

  return { status, maxLoad, inconclusive, misses, cohorts };
};

const exitCodes = { pass: 0, fail: 1, inconclusive: 3 };

const main = (argv) => {
  const [configPath, ...rest] = argv;
  const analyze = rest[0] === '--analyze';
  const measurementsPath = analyze ? rest[1] : rest[0];
  const replay = analyze && rest[2] === '--replay';
  const argCount = analyze ? (replay ? 3 : 2) : 1;
  if (!configPath || !measurementsPath || measurementsPath.startsWith('--') || rest.length !== argCount) {
    fail(
      'usage: node paired-timing.mjs <config.json> <measurements.json> | <config.json> --analyze <measurements.json> [--replay]'
    );
  }
  const { config, stamp } = readConfig(configPath);
  let measurements;
  if (analyze) {
    measurements = JSON.parse(readFileSync(measurementsPath, 'utf8'));
    if (JSON.stringify(measurements.config) !== JSON.stringify(stamp)) {
      if (!replay) fail(`${measurementsPath} was measured under another config; pass --replay to judge it under this one`);
      console.error('replay: judged under a config other than the one it was measured under');
    }
  } else {
    measurements = measure(config, stamp, measurementsPath);
    console.log(`measurements written to ${measurementsPath}`);
  }
  const result = judge(config, measurements);
  for (const { cohort, rows, noise } of result.cohorts) {
    for (const row of rows) {
      console.log(
        `${cohort} ${row.arm}: median pair ${row.statistic.toFixed(3)} [${row.pairs.map((pair) => pair.toFixed(3)).join(' ')}]`
      );
    }
    console.log(`${cohort} same-code noise ${noise.toFixed(3)}`);
  }
  console.log(`max one-minute load ${result.maxLoad.toFixed(2)}`);
  if (result.status === 'fail') console.error(`the candidate fails on ${result.misses.join(', ')}`);
  if (result.status !== 'pass' && result.inconclusive.length > 0) console.error(`inconclusive: ${result.inconclusive.join('; ')}`);
  if (result.status === 'pass') {
    console.log('the candidate passes every cohort; every planted arm failed past the same-code noise, and that noise stayed within the margin');
  }
  if (replay) {
    console.error(`replay: the verdict under this config is ${result.status}, and a replay exits 3 because it never decides`);
    return exitCodes.inconclusive;
  }
  return exitCodes[result.status];
};

try {
  process.exit(main(process.argv.slice(2)));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
