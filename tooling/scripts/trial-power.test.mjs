import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const script = path.join(import.meta.dirname, 'trial-power.mjs');

const powered = {
  incumbent: 'A',
  candidate: 'B',
  alternatives: ['C'],
  cases: 80,
  pilot: { caught: 6, cases: 8, grader: 'gpt-6-astra' },
  grader: 'gpt-6-astra',
  gain: 0.2,
  keep: { overIncumbent: 11, overAlternatives: 2 },
  dryGrade: 'dry-grade.tsv',
};

function trial(
  t,
  spec,
  { dryGrade = {}, dryCases = spec.cases, dryArms } = {}
) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'plate-trial-power-'));
  t.after(() => rmSync(dir, { force: true, recursive: true }));
  const arms = dryArms ?? [
    spec.incumbent,
    spec.candidate,
    ...(spec.alternatives ?? []),
  ];
  const lines = Array.from({ length: dryCases }, (_, i) =>
    arms.map(
      (arm) =>
        `c${i + 1}\t${arm}\t${dryGrade[`c${i + 1} ${arm}`] ?? 'pass\tfail'}`
    )
  ).flat();
  writeFileSync(path.join(dir, 'dry-grade.tsv'), `${lines.join('\n')}\n`);
  const specPath = path.join(dir, 'spec.json');
  writeFileSync(specPath, JSON.stringify(spec));
  const run = (...args) => {
    const result = spawnSync(process.execPath, [script, specPath, ...args], {
      encoding: 'utf-8',
    });
    return { status: result.status, output: result.stdout + result.stderr };
  };
  let digest;
  const analyze = (scores, frozen) => {
    writeFileSync(path.join(dir, 'scores.json'), JSON.stringify(scores));
    digest ??= run().output.match(/digest (\w+)/)[1];
    return run(
      '--analyze',
      path.join(dir, 'scores.json'),
      '--frozen',
      frozen ?? digest
    );
  };
  return { specPath, run, analyze };
}

test('accepts a keep rule that keeps the claimed gain and rarely a no-better candidate', (t) => {
  const { status, output } = trial(t, powered).run();
  assert.equal(status, 0, output);
  assert.match(output, /power 0\.735, worst false keep 0\.130/);
});

test('refuses a pilot graded by another grader than the trial', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    pilot: { ...powered.pilot, grader: 'gpt-6.1-sol' },
  }).run();
  assert.equal(status, 1, output);
  assert.match(output, /graded by gpt-6\.1-sol and the trial by gpt-6-astra/);
});

test('refuses cases that share a session', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    casesPerSession: 80,
  }).run();
  assert.equal(status, 1, output);
  assert.match(output, /80 cases share each session/);
});

test('refuses a key that docks the right answer under one version', (t) => {
  const { status, output } = trial(t, powered, {
    dryGrade: { 'c7 B': 'fail\tfail' },
  }).run();
  assert.equal(status, 1, output);
  assert.match(output, /docks a right answer on c7 for B,/);
});

test('refuses a key that passes the answer with its call flipped', (t) => {
  const { status, output } = trial(t, powered, {
    dryGrade: { 'c9 C': 'pass\tpass' },
  }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /does not fail the answer with its call flipped on c9 for C/
  );
});

test('refuses a gain the incumbent leaves no room for', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    pilot: { ...powered.pilot, caught: 8 },
  }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /already catches 1\.00, so a gain of 0\.2 cannot happen/
  );
});

test('refuses a dry grade that skips trial cases', (t) => {
  const { status, output } = trial(t, powered, { dryCases: 10 }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /needs one line for each of the 80 trial cases and each of the arms A, B, C/
  );
});

test('refuses a dry grade that skips an arm', (t) => {
  const { status, output } = trial(t, powered, { dryArms: ['A', 'B'] }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /needs one line for each of the 80 trial cases and each of the arms A, B, C/
  );
});

test('refuses a pilot that caught nothing', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    pilot: { ...powered.pilot, caught: 0 },
  }).run();
  assert.equal(status, 1, output);
  assert.match(output, /caught no pilot case/);
});

test('refuses a rule that keeps a candidate trading the incumbent catch for catch', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    cases: 40,
    keep: { overIncumbent: 5, overAlternatives: 2 },
  }).run();
  assert.equal(status, 1, output);
  assert.match(output, /no better than the incumbent up to 0\.261 of the time/);
});

test('refuses a rule whose power holds only at the pilot score itself', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    pilot: { ...powered.pilot, caught: 17, cases: 20 },
    gain: 0.15,
  }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /power cannot be shown to reach two in three \(search result 0\.607\)/
  );
});

const twoArms = {
  ...powered,
  alternatives: [],
  pilot: { ...powered.pilot, caught: 4 },
};

test('refuses power that falls short only at the incumbent rate allowing the widest pairing', (t) => {
  const { status, output } = trial(t, {
    ...twoArms,
    cases: 40,
    gain: 0.2364,
    keep: { overIncumbent: 7, overAlternatives: 0 },
  }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /power cannot be shown to reach two in three \(search result 0\.659\)/
  );
});

test('refuses power that dips below two in three inside the range of pairings', (t) => {
  const { status, output } = trial(t, {
    ...twoArms,
    cases: 30,
    gain: 0.2548641,
    keep: { overIncumbent: 6, overAlternatives: 0 },
  }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /power cannot be shown to reach two in three \(search result 0\.665\)/
  );
});

test('refuses a margin no score can reach', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    cases: 200,
    keep: { overIncumbent: 201, overAlternatives: 201 },
  }).run();
  assert.equal(status, 1, output);
  assert.match(
    output,
    /power cannot be shown to reach two in three \(search result 0\.000\)/
  );
});

test('exits 2 on malformed input instead of reporting a verdict', (t) => {
  const malformed = trial(t, powered);
  writeFileSync(malformed.specPath, 'null');
  assert.equal(malformed.run().status, 2);
  const directory = spawnSync(
    process.execPath,
    [script, path.dirname(malformed.specPath)],
    { encoding: 'utf-8' }
  );
  assert.equal(directory.status, 2, directory.stderr);
  const outOfRange = trial(t, powered).analyze({ A: 40, B: 81, C: 16 });
  assert.equal(outOfRange.status, 2, outOfRange.output);
});

test('refuses to analyze a result under a spec changed since the freeze', (t) => {
  const { status, output } = trial(t, powered).analyze(
    { A: 40, B: 51, C: 16 },
    '0000000000000000'
  );
  assert.equal(status, 2, output);
  assert.match(output, /changed since the freeze/);
});

test('calls a result under a refused spec inconclusive', (t) => {
  const { status, output } = trial(t, {
    ...powered,
    casesPerSession: 80,
  }).analyze({ A: 40, B: 51, C: 16 });
  assert.equal(status, 3, output);
  assert.match(output, /^inconclusive: the spec does not pass/);
});

test('calls a result inconclusive when an arm scored too high for any keep', (t) => {
  const run = trial(t, powered);
  const incumbent = run.analyze({ A: 70, B: 80, C: 10 });
  assert.equal(incumbent.status, 3, incumbent.output);
  assert.match(
    incumbent.output,
    /^inconclusive: A scored too high for any keep/
  );
  const alternative = run.analyze({ A: 40, B: 51, C: 79 });
  assert.equal(alternative.status, 3, alternative.output);
  assert.match(
    alternative.output,
    /^inconclusive: C scored too high for any keep/
  );
});

test('calls a result inconclusive when the incumbent and the candidate caught nothing', (t) => {
  const { status, output } = trial(t, powered).analyze({ A: 0, B: 0, C: 5 });
  assert.equal(status, 3, output);
  assert.match(output, /^inconclusive: A and B both caught nothing/);
});

test('keeps the candidate only when it clears both margins', (t) => {
  const run = trial(t, powered);
  const kept = run.analyze({ A: 40, B: 51, C: 49 });
  assert.equal(kept.status, 0, kept.output);
  const droppedOnAlternative = run.analyze({ A: 40, B: 51, C: 50 });
  assert.equal(droppedOnAlternative.status, 1, droppedOnAlternative.output);
  assert.match(
    droppedOnAlternative.output,
    /^drop: B misses a margin, so A stays/
  );
  const droppedOnIncumbent = run.analyze({ A: 41, B: 51, C: 16 });
  assert.equal(droppedOnIncumbent.status, 1, droppedOnIncumbent.output);
});
