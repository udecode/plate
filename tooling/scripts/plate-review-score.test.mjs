import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  architectureAxes,
  architectureCaps,
  confidenceDimensions,
  parseScoreArguments,
  scoreArchitecture,
} from './plate-review-score.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const perfectAxes = Object.fromEntries(
  architectureAxes.map(({ key }) => [key, 4])
);
const perfectConfidence = Object.fromEntries(
  confidenceDimensions.map(({ key }) => [key, 4])
);

test('weights total 10 architecture points and 100 confidence points', () => {
  assert.equal(
    architectureAxes.reduce((sum, { weight }) => sum + weight, 0),
    10
  );
  assert.equal(
    confidenceDimensions.reduce((sum, { weight }) => sum + weight, 0),
    100
  );

  const result = scoreArchitecture({
    axes: perfectAxes,
    confidence: perfectConfidence,
  });

  assert.equal(result.rawScore, 10);
  assert.equal(result.finalScore, 10);
  assert.equal(result.confidence, 100);
  assert.equal(result.confidencePoints.inventory.points, 35);
  assert.equal(result.displayScore, '10.0/10');
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.status, 'final');
});

test('reproduces the Comments-composition 2/10 ownership cap', () => {
  const result = scoreArchitecture({
    axes: {
      api: 1,
      boundary: 2,
      correctness: 2,
      lifetime: 0,
      owner: 0,
      proof: 3,
      scale: 1,
    },
    caps: ['wrong-owner', 'duplicate-truth'],
    confidence: {
      consumers: 3,
      inventory: 4,
      runtime: 2,
      trace: 4,
    },
  });

  assert.equal(result.rawScore, 2.5);
  assert.equal(result.finalScore, 2);
  assert.equal(result.confidence, 88);
  assert.equal(result.displayScore, '2.0/10');
  assert.deepEqual(
    result.appliedCaps.map(({ key }) => key),
    ['wrong-owner', 'duplicate-truth']
  );
});

test('caps wrong lifetimes, reachability contradictions, and blockers', () => {
  assert.equal(
    scoreArchitecture({
      axes: perfectAxes,
      caps: ['wrong-lifetime'],
      confidence: perfectConfidence,
    }).finalScore,
    3
  );
  assert.equal(
    scoreArchitecture({
      axes: perfectAxes,
      caps: ['reachability-contradiction'],
      confidence: perfectConfidence,
    }).finalScore,
    5
  );

  const blocker = scoreArchitecture({
    axes: perfectAxes,
    caps: ['correctness-blocker'],
    confidence: perfectConfidence,
  });
  assert.equal(blocker.finalScore, 1);
  assert.equal(blocker.status, 'blocker');
  assert.equal(blocker.displayScore, '1.0/10 (blocker)');
});

test('does not publish a final score for provisional or incomplete evidence', () => {
  const provisional = scoreArchitecture({
    axes: perfectAxes,
    caps: ['unmeasured-scale'],
    confidence: perfectConfidence,
  });
  assert.equal(provisional.finalScore, null);
  assert.equal(provisional.scoreCeiling, 6);
  assert.equal(provisional.displayScore, '≤6.0/10 (provisional)');

  const incomplete = scoreArchitecture({
    axes: perfectAxes,
    caps: ['incomplete-manifest'],
    confidence: perfectConfidence,
  });
  assert.equal(incomplete.finalScore, null);
  assert.equal(incomplete.scoreCeiling, null);
  assert.equal(incomplete.status, 'incomplete');
  assert.equal(incomplete.displayScore, 'incomplete (no numeric score)');
});

test('rejects missing, unknown, fractional, and duplicate inputs', () => {
  assert.throws(
    () =>
      scoreArchitecture({
        axes: { ...perfectAxes, owner: 2.5 },
        confidence: perfectConfidence,
      }),
    /must be an integer from 0 to 4/
  );
  assert.throws(
    () =>
      scoreArchitecture({
        axes: { ...perfectAxes, extra: 4 },
        confidence: perfectConfidence,
      }),
    /Unknown architecture grades: extra/
  );
  assert.throws(
    () =>
      scoreArchitecture({
        axes: Object.fromEntries(
          Object.entries(perfectAxes).filter(([key]) => key !== 'proof')
        ),
        confidence: perfectConfidence,
      }),
    /Missing architecture grades: proof/
  );
  assert.throws(
    () =>
      scoreArchitecture({
        axes: perfectAxes,
        caps: ['wrong-owner', 'wrong-owner'],
        confidence: perfectConfidence,
      }),
    /caps must not contain duplicates/
  );
  assert.throws(
    () =>
      scoreArchitecture({
        axes: perfectAxes,
        caps: ['invented-cap'],
        confidence: perfectConfidence,
      }),
    /Unknown caps: invented-cap/
  );
});

test('parses the repeated CLI contract and rejects duplicate keys', () => {
  assert.deepEqual(
    parseScoreArguments([
      '--axis',
      'owner=0',
      '--confidence',
      'inventory=4',
      '--cap',
      'wrong-owner',
    ]),
    {
      axes: { owner: 0 },
      caps: ['wrong-owner'],
      confidence: { inventory: 4 },
    }
  );
  assert.throws(
    () => parseScoreArguments(['--axis', 'owner=0', '--axis', 'owner=1']),
    /repeats owner/
  );
});

test('runs as a deterministic JSON CLI', () => {
  const arguments_ = [
    ...Object.keys(perfectAxes).flatMap((key) => ['--axis', `${key}=4`]),
    ...Object.keys(perfectConfidence).flatMap((key) => [
      '--confidence',
      `${key}=4`,
    ]),
    '--cap',
    'wrong-lifetime',
  ];
  const result = spawnSync(
    process.execPath,
    [join(root, 'tooling/scripts/plate-review-score.mjs'), ...arguments_],
    { encoding: 'utf-8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).finalScore, 3);
});

test('keeps source, generated skill, modes, rubric, and caps in sync', () => {
  const sourcePath = '.agents/rules/plate-review.mdc';
  const generatedPath = '.agents/skills/plate-review/SKILL.md';
  const source = readFileSync(join(root, sourcePath), 'utf-8');
  const generated = readFileSync(join(root, generatedPath), 'utf-8');
  const claudeGenerated = readFileSync(
    join(root, '.claude/skills/plate-review/SKILL.md'),
    'utf-8'
  );
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);

  assert.ok(frontmatter, 'source skill needs YAML frontmatter');
  const sourceBody = source.slice(frontmatter[0].length);
  const expectedGenerated = `---\n${frontmatter[1]}\nname: plate-review\nmetadata:\n  skiller:\n    source: ${sourcePath}\n---${sourceBody}`;
  assert.equal(generated, expectedGenerated);
  assert.equal(claudeGenerated, expectedGenerated);

  for (const mode of ['all', 'plugin', 'entrypoint', 'package', 'surface']) {
    assert.ok(source.includes(`### \`${mode}`), `missing ${mode} mode`);
  }
  for (const { key, weight } of architectureAxes) {
    assert.ok(
      source.includes(`| \`${key}\` | ${weight.toFixed(1)} |`),
      `missing ${key} weight from source skill`
    );
  }
  for (const { key } of architectureCaps) {
    assert.ok(source.includes(`| \`${key}\` |`), `missing ${key} cap`);
  }

  const packageJson = JSON.parse(readFileSync(join(root, 'package.json')));
  assert.equal(
    packageJson.scripts['check:plate-review'],
    'node --test tooling/scripts/plate-review-score.test.mjs'
  );

  const sourceAgents = readFileSync(join(root, '.agents/AGENTS.md'), 'utf-8');
  const generatedAgents = readFileSync(join(root, 'AGENTS.md'), 'utf-8');
  assert.ok(generatedAgents.endsWith(sourceAgents));
  assert.match(sourceAgents, /architecture score[\s\S]*`plate-review`/);
});
