import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'paired-timing.mjs');

const createDir = (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'paired-timing-'));
  t.after(() => rmSync(dir, { force: true, recursive: true }));
  return dir;
};

const arm = (name) => ({ command: ['node', 'arm.mjs', name], source: `/src/${name}/` });

const baseConfig = {
  metric: 'median',
  budget: 1.05,
  loadLimit: 6,
  cohorts: ['small'],
  arms: { base: arm('base'), candidate: arm('candidate'), planted: arm('planted'), copy: arm('copy') },
  planted: { planted: ['small'] },
  sameCode: { copy: ['small'] },
};

const twoCohorts = {
  ...baseConfig,
  cohorts: ['small', 'large'],
  planted: { planted: ['small', 'large'] },
  sameCode: { copy: ['small', 'large'] },
};

const measurementsFrom = (config, valuesByCohort, load = 3) => {
  const runs = new Map();
  for (const [cohort, values] of Object.entries(valuesByCohort)) {
    for (const [name, perPacket] of Object.entries(values)) {
      perPacket.forEach((median, packet) => {
        const key = `${name} ${packet}`;
        if (!runs.has(key)) runs.set(key, { arm: name, packet, load, loaded: [`/src/${name}/index.ts`], results: [] });
        runs.get(key).results.push({ cohort, median });
      });
    }
  }
  return { config, runs: [...runs.values()] };
};

const small = (values, load) => measurementsFrom(baseConfig, { small: values }, load);

const analyzeText = (t, config, text, ...flags) => {
  const dir = createDir(t);
  writeFileSync(join(dir, 'config.json'), JSON.stringify(config));
  writeFileSync(join(dir, 'measurements.json'), text);
  return spawnSync('node', [script, join(dir, 'config.json'), '--analyze', join(dir, 'measurements.json'), ...flags], {
    encoding: 'utf8',
  });
};

const analyze = (t, config, measurements, ...flags) => analyzeText(t, config, JSON.stringify(measurements), ...flags);

const measureWith = (t, config, armSource) => {
  const dir = createDir(t);
  writeFileSync(join(dir, 'arm.mjs'), armSource);
  writeFileSync(join(dir, 'config.json'), JSON.stringify(config));
  const out = join(dir, 'measurements.json');
  const run = () => spawnSync('node', [script, join(dir, 'config.json'), out], { encoding: 'utf8', cwd: dir });
  return { dir, out, run };
};

const steadyArm = `import { appendFileSync } from 'node:fs';
const arm = process.argv[2];
appendFileSync('order.txt', arm + '\\n');
const medians = { base: 10, candidate: 10.1, planted: 12, copy: 10.1 };
console.log('warming up');
console.log(JSON.stringify({ label: arm, loaded: ['/src/' + arm + '/index.ts'], results: [{ cohort: 'small', median: medians[arm] }] }));
`;

const flat = (value) => Array(6).fill(value);
const pairs = (...ratios) => ratios.flatMap((ratio) => [10 * ratio, 10 * ratio]);

test('passes a candidate within budget when the planted arm fails past the noise and the copy agrees', (t) => {
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: flat(10.2), planted: flat(11), copy: flat(10.1) }));
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /the candidate passes every cohort/);
});

test('fails a candidate over budget in two of its three packet pairs', (t) => {
  const slow = [11, 11, 11, 11, 10, 10];
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: slow, planted: flat(11.5), copy: slow }));
  assert.equal(run.status, 1, run.stderr);
  assert.match(run.stderr, /the candidate fails on small/);
});

test('passes a candidate over budget in one packet pair of three', (t) => {
  const slow = [10, 10, 10, 10, 11, 11];
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: slow, planted: flat(11.5), copy: slow }));
  assert.equal(run.status, 0, run.stderr);
});

test('reports a line whose planted slowdown passes as inconclusive, never as a pass', (t) => {
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: flat(10.1), planted: flat(10.2), copy: flat(10.1) }));
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /small: planted planted scored 1\.020, not past the budget 1\.05/);
});

test('reports a planted arm that fails by no more than the same-code noise as inconclusive', (t) => {
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: flat(10), planted: flat(10.8), copy: flat(10.4) }));
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /planted planted scored 1\.080, not past the budget 1\.05 by more than the same-code noise 0\.040/);
  assert.doesNotMatch(run.stderr, /reaches the candidate's margin/);
});

test('reports a passing candidate as inconclusive when its same-code copy fails', (t) => {
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: flat(10.2), planted: flat(11), copy: flat(10.8) }));
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /the same-code noise 0\.060 reaches the candidate's margin 0\.030/);
});

test('measures same-code noise pair by pair, not between summary ranks', (t) => {
  const run = analyze(
    t,
    baseConfig,
    small({ base: flat(10), candidate: pairs(0.95, 1.04, 1.06), planted: flat(12), copy: pairs(1.04, 1.06, 0.95) })
  );
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /the same-code noise 0\.090 reaches the candidate's margin 0\.010/);
});

test('reports inconclusive when two passing copies of the same code differ by the margin', (t) => {
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: flat(10.46), planted: flat(11), copy: flat(10.4) }));
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /the same-code noise 0\.006 reaches the candidate's margin 0\.004/);
});

for (const [shape, candidate, copy, message] of [
  ['a passing candidate beside a copy over the budget', [1, 1.1, 1.04], [1, 1.1, 1.2], /the same-code noise 0\.060 reaches the candidate's margin 0\.010/],
  ['a failing candidate beside a copy under the budget', [1, 1.1, 1.06], [1, 1.1, 0.9], /the same-code noise 0\.060 reaches the candidate's margin 0\.010/],
  ['one disagreeing pair that sets both medians', [1, 1, 1.1], [1, 1.1, 1.1], /the same-code noise 0\.100 reaches the candidate's margin 0\.050/],
  ['a small disagreement across the budget', [1.04, 1.04, 1.06], [1.04, 1.06, 1.06], /the same-code noise 0\.020 reaches the candidate's margin 0\.010/],
]) {
  test(`reports inconclusive when the copy's median differs from the candidate's though most pairs match: ${shape}`, (t) => {
    const run = analyze(t, baseConfig, small({ base: flat(10), candidate: pairs(...candidate), planted: flat(13), copy: pairs(...copy) }));
    assert.equal(run.status, 3, run.stderr);
    assert.match(run.stderr, message);
  });
}

test('takes the noisiest of several same-code arms', (t) => {
  const config = { ...baseConfig, arms: { ...baseConfig.arms, copy2: arm('copy2') }, sameCode: { copy: ['small'], copy2: ['small'] } };
  const run = analyze(
    t,
    config,
    measurementsFrom(config, { small: { base: flat(10), candidate: flat(10.2), planted: flat(12), copy: flat(10.2), copy2: flat(10.6) } })
  );
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /the same-code noise 0\.040 reaches the candidate's margin 0\.030/);
});

test('requires every planted arm on a cohort to fail past the noise', (t) => {
  const config = { ...baseConfig, arms: { ...baseConfig.arms, weak: arm('weak') }, planted: { planted: ['small'], weak: ['small'] } };
  const run = analyze(
    t,
    config,
    measurementsFrom(config, { small: { base: flat(10), candidate: flat(10), planted: flat(12), weak: flat(10.3), copy: flat(10) } })
  );
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /planted weak scored 1\.030/);
});

const steadySmall = { base: flat(10), candidate: flat(10), planted: flat(12), copy: flat(10) };

test('checks the planted arms on every cohort, not only the first', (t) => {
  const run = analyze(
    t,
    twoCohorts,
    measurementsFrom(twoCohorts, { small: steadySmall, large: { base: flat(10), candidate: flat(10), planted: flat(10.2), copy: flat(10) } })
  );
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /large: planted planted scored 1\.020/);
});

test('checks the same-code noise on every cohort, not only the first', (t) => {
  const run = analyze(
    t,
    twoCohorts,
    measurementsFrom(twoCohorts, { small: steadySmall, large: { base: flat(10), candidate: flat(10.2), planted: flat(12), copy: flat(10.6) } })
  );
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /large: the same-code noise 0\.040 reaches/);
});

test('refuses a flag where the measurements path belongs instead of measuring into it', (t) => {
  const dir = createDir(t);
  writeFileSync(join(dir, 'config.json'), JSON.stringify(baseConfig));
  const run = spawnSync('node', [script, 'config.json', '--replay'], { encoding: 'utf8', cwd: dir });
  assert.equal(run.status, 2, run.stderr);
  assert.match(run.stderr, /usage: node paired-timing\.mjs/);
  assert.equal(existsSync(join(dir, '--replay')), false);
});

test('keeps linear drift from failing identical code across mirrored packets', (t) => {
  const order = ['base', 'candidate', 'planted', 'copy'];
  const runs = [];
  let invocation = 0;
  for (let packet = 0; packet < 6; packet++) {
    for (const name of packet % 2 === 0 ? order : [...order].reverse()) {
      const median = (10 + invocation) * (name === 'planted' ? 2 : 1);
      runs.push({ arm: name, packet, load: 3, loaded: [`/src/${name}/index.ts`], results: [{ cohort: 'small', median }] });
      invocation += 1;
    }
  }
  const run = analyze(t, baseConfig, { config: baseConfig, runs });
  assert.equal(run.status, 0, run.stderr);
});

test('reports a loaded host as inconclusive', (t) => {
  const run = analyze(t, baseConfig, small({ base: flat(10), candidate: flat(10), planted: flat(11), copy: flat(10) }, 9));
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /one-minute load reached 9\.00 > 6/);
});

test('fails a conclusive miss on one cohort even when another cohort is inconclusive', (t) => {
  const run = analyze(
    t,
    twoCohorts,
    measurementsFrom(twoCohorts, {
      small: { base: flat(10), candidate: flat(10), planted: flat(10.2), copy: flat(10) },
      large: { base: flat(10), candidate: flat(12), planted: flat(13), copy: flat(12) },
    })
  );
  assert.equal(run.status, 1, run.stderr);
  assert.match(run.stderr, /the candidate fails on large/);
  assert.match(run.stderr, /inconclusive: small: planted planted scored 1\.020/);
});

test('judges each cohort against its own budget when the config gives one per cohort', (t) => {
  const config = { ...twoCohorts, budget: { small: 0.8, large: 0.5 } };
  const run = analyze(
    t,
    config,
    measurementsFrom(config, {
      small: { base: flat(10), candidate: flat(7), planted: flat(9), copy: flat(7) },
      large: { base: flat(10), candidate: flat(6), planted: flat(7), copy: flat(6) },
    })
  );
  assert.equal(run.status, 1, run.stderr);
  assert.match(run.stderr, /the candidate fails on large$/m);
});

test('refuses a per-cohort budget that leaves a judged cohort without one', (t) => {
  const config = { ...twoCohorts, budget: { small: 0.8 } };
  const run = analyze(
    t,
    config,
    measurementsFrom(config, {
      small: { base: flat(10), candidate: flat(7), planted: flat(9), copy: flat(7) },
      large: { base: flat(10), candidate: flat(6), planted: flat(7), copy: flat(6) },
    })
  );
  assert.equal(run.status, 2, run.stderr);
  assert.match(run.stderr, /config\.budget\.large must be a positive ratio/);
});

test('judges extreme finite measurements by their ratios and refuses a ratio out of range', (t) => {
  const swing = [1e-200, 1e200, 1e-200, 1e200, 1e-200, 1e200];
  const reversed = [1e200, 1e-200, 1e200, 1e-200, 1e200, 1e-200];
  const balanced = analyze(t, baseConfig, small({ base: swing, candidate: swing, planted: reversed, copy: swing }));
  assert.equal(balanced.status, 3, balanced.stderr);
  assert.match(balanced.stderr, /planted planted scored 1\.000/);

  const overflow = analyze(t, baseConfig, small({ base: flat(1e-300), candidate: flat(1e300), planted: flat(1e300), copy: flat(1e300) }));
  assert.equal(overflow.status, 2);
  assert.match(overflow.stderr, /candidate's pair 0 ratio on small is out of range: Infinity/);
});

test('refuses a config that leaves a cohort without a control, or that a control cannot check', (t) => {
  const values = small({ base: flat(10), candidate: flat(10), planted: flat(11), copy: flat(10) });
  const refusals = [
    [{ ...twoCohorts, planted: { planted: ['small'] } }, /config\.planted has no arm for large; a line with no planted slowdown cannot fail/],
    [{ ...twoCohorts, sameCode: { copy: ['small'] } }, /config\.sameCode has no arm for large; without a same-code arm, the run cannot measure its own noise/],
    [{ ...baseConfig, sameCode: { copy: ['small'], planted: ['small'] } }, /planted cannot be both a planted arm and a same-code arm/],
    [{ ...baseConfig, sameCode: { candidate: ['small'] } }, /config\.sameCode cannot use the candidate arm/],
    [{ ...baseConfig, arms: { ...baseConfig.arms, copy: { command: ['node', 'arm.mjs', 'copy'] } } }, /config\.arms\.copy\.source must be text/],
  ];
  for (const [config, message] of refusals) {
    const run = analyze(t, config, values);
    assert.equal(run.status, 2, `${message}: ${run.stderr}`);
    assert.match(run.stderr, message);
  }
});

test('refuses a measurement matrix with a missing cohort or a duplicate run', (t) => {
  const missing = small({ base: flat(10), candidate: flat(10), planted: flat(11), copy: flat(10) });
  missing.runs.find((run) => run.arm === 'copy').results = [];
  const missingRun = analyze(t, baseConfig, missing);
  assert.equal(missingRun.status, 2);
  assert.match(missingRun.stderr, /copy packet 0 reports cohorts , not small/);

  const duplicate = small({ base: flat(10), candidate: flat(10), planted: flat(11), copy: flat(10) });
  duplicate.runs.push({ arm: 'candidate', packet: 2, load: 3, loaded: ['/src/candidate/index.ts'], results: [{ cohort: 'small', median: 99 }] });
  const duplicateRun = analyze(t, baseConfig, duplicate);
  assert.equal(duplicateRun.status, 2);
  assert.match(duplicateRun.stderr, /expected one run of candidate in packet 2, found 2/);
});

test('refuses measurements in which every arm dropped a cohort the config judges', (t) => {
  const run = analyze(t, twoCohorts, measurementsFrom(twoCohorts, { small: { base: flat(10), candidate: flat(10.2), planted: flat(12), copy: flat(10.1) } }));
  assert.equal(run.status, 2, run.stderr);
  assert.match(run.stderr, /base packet 0 reports cohorts small, not small, large/);
});

test('refuses a run with no finite load, or a metric that is infinite, zero or negative', (t) => {
  const noLoad = small({ base: flat(10), candidate: flat(10), planted: flat(11), copy: flat(10) }, 99);
  delete noLoad.runs[5].load;
  const noLoadRun = analyze(t, baseConfig, noLoad);
  assert.equal(noLoadRun.status, 2);
  assert.match(noLoadRun.stderr, /has no finite load/);

  const infinite = JSON.stringify(small({ base: flat(10), candidate: flat(10), planted: flat(11), copy: flat(10) })).replace(
    '"median":10}',
    '"median":1e309}'
  );
  const infiniteRun = analyzeText(t, baseConfig, infinite);
  assert.equal(infiniteRun.status, 2);
  assert.match(infiniteRun.stderr, /has no finite positive median for small/);

  for (const bad of [0, -10]) {
    const run = analyze(t, baseConfig, small({ base: flat(10), candidate: flat(bad), planted: flat(11), copy: flat(bad) }));
    assert.equal(run.status, 2, `metric ${bad}: ${run.stderr}`);
    assert.match(run.stderr, /candidate packet 0 has no finite positive median for small/);
  }
});

test('refuses a run whose saved files lie outside its source when analyzing', (t) => {
  const foreign = small({ base: flat(10), candidate: flat(10), planted: flat(11), copy: flat(10) });
  foreign.runs.find((run) => run.arm === 'copy').loaded = ['/foreign/index.ts'];
  const run = analyze(t, baseConfig, foreign);
  assert.equal(run.status, 2);
  assert.match(run.stderr, /copy packet 0 ran files outside \/src\/copy\/: \["\/foreign\/index\.ts"\]/);
});

test('accepts a budget at or below 1, such as a required improvement', (t) => {
  const config = { ...baseConfig, budget: 0.95 };
  const run = analyze(t, config, measurementsFrom(config, { small: { base: flat(10), candidate: flat(9), planted: flat(10.5), copy: flat(9.05) } }));
  assert.equal(run.status, 0, run.stderr);
});

test('refuses to judge measurements taken under another config unless asked to replay them', (t) => {
  const measured = small({ base: flat(10), candidate: flat(10.2), planted: flat(12), copy: flat(10.1) });
  const looser = { ...baseConfig, budget: 1.1 };
  const refused = analyze(t, looser, measured);
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /was measured under another config; pass --replay to judge it under this one/);

  const replayed = analyze(t, looser, measured, '--replay');
  assert.equal(replayed.status, 3, replayed.stderr);
  assert.match(replayed.stderr, /replay: the verdict under this config is pass, and a replay exits 3 because it never decides/);
});

test('exits 2, not the failing code 1, when an arm fails, and keeps the runs before it', (t) => {
  const { out, run } = measureWith(
    t,
    baseConfig,
    `const arm = process.argv[2];
if (arm === 'copy') process.exit(1);
console.log(JSON.stringify({ loaded: ['/src/' + arm + '/index.ts'], results: [{ cohort: 'small', median: 10 }] }));
`
  );
  const result = run();
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /Command failed: node arm\.mjs copy/);
  assert.deepEqual(
    JSON.parse(readFileSync(out, 'utf8')).runs.map((entry) => entry.arm),
    ['base', 'candidate', 'planted']
  );
});

test('saves a run that ran files outside its source before refusing it', (t) => {
  const config = { ...baseConfig, arms: { ...baseConfig.arms, copy: { ...baseConfig.arms.copy, source: '/src/elsewhere/' } } };
  const { out, run } = measureWith(t, config, steadyArm);
  const result = run();
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /copy packet 0 ran files outside \/src\/elsewhere\/: \["\/src\/copy\/index\.ts"\]/);
  const saved = JSON.parse(readFileSync(out, 'utf8')).runs;
  assert.deepEqual(saved.map((entry) => entry.arm), ['base', 'candidate', 'planted', 'copy']);
  assert.deepEqual(saved[3].loaded, ['/src/copy/index.ts']);
});

test('runs when started through a symlink, so a linked path cannot exit 0 unjudged', (t) => {
  const link = join(createDir(t), 'linked-paired-timing.mjs');
  symlinkSync(script, link);
  const run = spawnSync('node', [link], { encoding: 'utf8' });
  assert.equal(run.status, 2, run.stderr);
  assert.match(run.stderr, /usage: node paired-timing\.mjs/);
});

test('reverses the arm order every odd packet, saves every run with its config, and never overwrites an attempt', (t) => {
  const config = { ...baseConfig, loadLimit: 1000 };
  const { dir, out, run } = measureWith(t, config, steadyArm);
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  const forward = ['base', 'candidate', 'planted', 'copy'];
  const backward = [...forward].reverse();
  assert.deepEqual(readFileSync(join(dir, 'order.txt'), 'utf8').trim().split('\n'), [
    ...forward,
    ...backward,
    ...forward,
    ...backward,
    ...forward,
    ...backward,
  ]);
  const saved = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(saved.runs.length, 24);
  assert.deepEqual(saved.runs[0].loaded, ['/src/base/index.ts']);
  assert.equal(saved.runs[0].label, 'base');
  assert.deepEqual(saved.config, config);

  const second = run();
  assert.equal(second.status, 2);
  assert.match(second.stderr, /exists; write each attempt to a new file/);
});
