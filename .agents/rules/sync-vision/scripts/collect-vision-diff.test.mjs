import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(scriptDir, '../../../..');
const collectorPath = '.agents/rules/sync-vision/scripts/collect-vision-diff.mjs';
const checkerPath = '.agents/skills/autogoal/scripts/check-complete.mjs';
const checkpointPath = 'docs/sync/vision/status.json';

function createFixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'vision-collector-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const relativePath of [collectorPath, checkerPath]) {
    const destination = path.join(root, relativePath);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(path.join(sourceRoot, relativePath), destination);
  }
  mkdirSync(path.join(root, 'docs/plans'), { recursive: true });
  mkdirSync(path.dirname(path.join(root, checkpointPath)), { recursive: true });
  writeFileSync(path.join(root, 'AGENTS.md'), '# Disposable test fixture\n');
  writeFileSync(path.join(root, 'VISION.md'), '# Vision\nInitial doctrine.\n');

  function git(...args) {
    const result = spawnSync(
      'git',
      ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args],
      { cwd: root, encoding: 'utf8' }
    );
    if (result.status !== 0) throw new Error(result.stderr);
    return result.stdout.trim();
  }

  git('init', '-q');
  git('config', 'user.name', 'Vision collector test');
  git('config', 'user.email', 'vision-test@example.invalid');
  git('add', 'AGENTS.md', 'VISION.md');
  git('commit', '-qm', 'Initial fixture');
  const base = git('rev-parse', 'HEAD');
  writeFileSync(path.join(root, 'VISION.md'), '# Vision\nVerify public API doctrine.\n');
  git('add', 'VISION.md');
  git('commit', '-qm', 'Changed fixture doctrine');
  const target = git('rev-parse', 'HEAD');
  const checkpoint = JSON.stringify({ schemaVersion: 1, lastSyncedCommit: base });
  writeFileSync(path.join(root, checkpointPath), checkpoint);

  return {
    root,
    checkpoint,
    target,
    run: (...args) =>
      spawnSync(process.execPath, [path.join(root, collectorPath), ...args], {
        cwd: root,
        encoding: 'utf8',
      }),
  };
}

function writeCompletedPlan(root) {
  const plan = 'docs/plans/vision-sync.md';
  writeFileSync(
    path.join(root, plan),
    `# Classified vision inputs

Objective:
Account for the committed public API doctrine change.

Completion threshold:
The changed doctrine is classified and reaffirmed.

Verification surface:
Read the committed VISION.md change and collected candidate.

Constraints:
Only committed inputs advance the checkpoint.

Boundaries:
The disposable fixture repository owns this run.

Blocked condition:
Stop if the committed range cannot be read.

Work Checklist:
- [x] Reaffirm the changed doctrine from current source.

Phase / pass table:
| Phase | Status |
| --- | --- |
| Classify | complete |

Verification evidence:
The committed VISION.md candidate is reaffirmed by source inspection.

Reboot status:
The committed range is ready for checkpoint advancement.

Open risks:
None.
`
  );
  return plan;
}

test('a missing plan cannot advance the checkpoint', (t) => {
  const fixture = createFixture(t);
  const result = fixture.run('--advance', '--plan', 'docs/plans/missing.md');
  assert.notEqual(result.status, 0, result.stdout);
  assert.equal(
    readFileSync(path.join(fixture.root, checkpointPath), 'utf8'),
    fixture.checkpoint
  );
});

test('advancement requires a complete plan and accepts the completed file', (t) => {
  const fixture = createFixture(t);
  const plan = 'docs/plans/vision-sync.md';
  writeFileSync(
    path.join(fixture.root, plan),
    '# Vision sync\n\nWork Checklist:\n- [ ] Classify the committed input.\n'
  );
  const incomplete = fixture.run('--advance', '--plan', plan);
  assert.notEqual(incomplete.status, 0, incomplete.stdout);
  assert.equal(
    readFileSync(path.join(fixture.root, checkpointPath), 'utf8'),
    fixture.checkpoint
  );

  writeCompletedPlan(fixture.root);
  const completed = fixture.run('--advance', '--plan', plan);
  assert.equal(completed.status, 0, completed.stderr);
  assert.equal(JSON.parse(completed.stdout).advanced, true);
  assert.equal(
    JSON.parse(readFileSync(path.join(fixture.root, checkpointPath), 'utf8'))
      .lastSyncedCommit,
    fixture.target
  );
});

test('preview collects evidence without advancing an explicitly requested checkpoint', (t) => {
  const fixture = createFixture(t);
  const plan = writeCompletedPlan(fixture.root);
  const result = fixture.run('--dry-run', '--advance', '--plan', plan);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.advanced, false);
  assert.equal(
    readFileSync(path.join(fixture.root, checkpointPath), 'utf8'),
    fixture.checkpoint
  );
  assert.equal(output.committedChangedFiles, 1);
  assert.equal(
    JSON.parse(readFileSync(path.join(fixture.root, output.runDir, 'run.json'), 'utf8'))
      .target,
    fixture.target
  );
});
