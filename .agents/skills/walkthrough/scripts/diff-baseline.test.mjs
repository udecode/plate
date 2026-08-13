import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'diff-baseline.mjs'
);

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

function runHelper(args, cwd) {
  run('node', [script, ...args], cwd);
}

function createRepo() {
  const repo = mkdtempSync(path.join(tmpdir(), 'walkthrough-'));
  run('git', ['init', '-q'], repo);
  run('git', ['config', 'user.email', 'walkthrough@example.com'], repo);
  run('git', ['config', 'user.name', 'Walkthrough Test'], repo);
  writeFileSync(path.join(repo, 'tracked.txt'), 'before\n');
  run('git', ['add', 'tracked.txt'], repo);
  run('git', ['commit', '-qm', 'initial'], repo);
  return repo;
}

function readReceipt(receiptPath) {
  return JSON.parse(readFileSync(receiptPath, 'utf8'));
}

test('detects a committed packet diff after the working tree is clean', () => {
  const repo = createRepo();

  try {
    const baselinePath = path.join(repo, '.git', 'baseline.json');
    const receiptPath = path.join(repo, '.git', 'receipt.json');

    runHelper(['capture', '--output', baselinePath], repo);
    writeFileSync(path.join(repo, 'tracked.txt'), 'after\n');
    run('git', ['add', 'tracked.txt'], repo);
    run('git', ['commit', '-qm', 'change tracked file'], repo);
    runHelper(
      ['compare', '--baseline', baselinePath, '--output', receiptPath],
      repo
    );

    const receipt = readReceipt(receiptPath);
    assert.equal(receipt.producedFileDiff, true);
    assert.equal(receipt.headChanged, true);
    assert.deepEqual(receipt.changedPaths, ['tracked.txt']);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('ignores an empty commit', () => {
  const repo = createRepo();

  try {
    const baselinePath = path.join(repo, '.git', 'baseline.json');
    const receiptPath = path.join(repo, '.git', 'receipt.json');

    runHelper(['capture', '--output', baselinePath], repo);
    run('git', ['commit', '--allow-empty', '-qm', 'metadata only'], repo);
    runHelper(
      ['compare', '--baseline', baselinePath, '--output', receiptPath],
      repo
    );

    const receipt = readReceipt(receiptPath);
    assert.equal(receipt.headChanged, true);
    assert.equal(receipt.producedFileDiff, false);
    assert.deepEqual(receipt.changedPaths, []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('does not count its own unignored receipt files', () => {
  const repo = createRepo();

  try {
    const baselinePath = path.join(repo, 'evidence', 'baseline.json');
    const receiptPath = path.join(repo, 'evidence', 'receipt.json');

    runHelper(['capture', '--output', baselinePath], repo);
    runHelper(
      ['compare', '--baseline', baselinePath, '--output', receiptPath],
      repo
    );

    const receipt = readReceipt(receiptPath);
    assert.equal(receipt.producedFileDiff, false);
    assert.deepEqual(receipt.changedPaths, []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('detects executable-bit and untracked-file changes', () => {
  const repo = createRepo();

  try {
    const baselinePath = path.join(repo, '.git', 'baseline.json');
    const receiptPath = path.join(repo, '.git', 'receipt.json');

    runHelper(['capture', '--output', baselinePath], repo);
    chmodSync(path.join(repo, 'tracked.txt'), 0o755);
    writeFileSync(path.join(repo, 'new.txt'), 'new\n');
    runHelper(
      ['compare', '--baseline', baselinePath, '--output', receiptPath],
      repo
    );

    const receipt = readReceipt(receiptPath);
    assert.equal(receipt.producedFileDiff, true);
    assert.deepEqual(receipt.changedPaths, ['new.txt', 'tracked.txt']);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
