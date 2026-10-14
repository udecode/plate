#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

function fail(message) {
  process.stderr.write(`walkthrough diff baseline: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const values = new Map();

  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key?.startsWith('--') || !value) {
      fail('expected --key value arguments');
    }
    values.set(key.slice(2), value);
  }

  return { command, values };
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: null,
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.status !== 0) {
    fail(
      `git ${args.join(' ')} failed: ${result.stderr?.toString('utf8').trim()}`
    );
  }

  return result.stdout;
}

function splitNull(buffer) {
  return buffer.toString('utf8').split('\0').filter(Boolean).sort();
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fileRecord(repoRoot, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return { path: relativePath, kind: 'missing' };
  }

  const stats = lstatSync(absolutePath);
  if (stats.isSymbolicLink()) {
    const target = readlinkSync(absolutePath);
    return {
      path: relativePath,
      kind: 'symlink',
      sha256: sha256(target),
      size: Buffer.byteLength(target),
    };
  }

  if (!stats.isFile()) {
    return { path: relativePath, kind: 'other' };
  }

  const contents = readFileSync(absolutePath);
  return {
    path: relativePath,
    kind: 'file',
    executable: (stats.mode & 0o111) !== 0,
    sha256: sha256(contents),
    size: contents.length,
  };
}

function excludedRepoPaths(repoRoot, candidates) {
  return new Set(
    candidates
      .map((candidate) => {
        const absolutePath = path.resolve(candidate);
        return path.relative(
          repoRoot,
          existsSync(absolutePath) ? realpathSync(absolutePath) : absolutePath
        );
      })
      .filter(
        (relativePath) =>
          relativePath &&
          relativePath !== '..' &&
          !relativePath.startsWith(`..${path.sep}`) &&
          !path.isAbsolute(relativePath)
      )
  );
}

function snapshot(cwd, excludedPaths = []) {
  const repoRoot = realpathSync(
    runGit(cwd, ['rev-parse', '--show-toplevel']).toString('utf8').trim()
  );
  const excluded = excludedRepoPaths(repoRoot, excludedPaths);
  const head = runGit(repoRoot, ['rev-parse', 'HEAD']).toString('utf8').trim();
  const trackedPatch = runGit(repoRoot, [
    'diff',
    '--binary',
    'HEAD',
    '--',
    '.',
  ]);
  const trackedWorkingPaths = splitNull(
    runGit(repoRoot, ['diff', '--name-only', '-z', 'HEAD', '--', '.'])
  );
  const trackedPaths = splitNull(runGit(repoRoot, ['ls-files', '-z'])).filter(
    (relativePath) => !excluded.has(relativePath)
  );
  const trackedFiles = trackedPaths.map((relativePath) =>
    fileRecord(repoRoot, relativePath)
  );
  const untrackedPaths = splitNull(
    runGit(repoRoot, ['ls-files', '--others', '--exclude-standard', '-z'])
  ).filter((relativePath) => !excluded.has(relativePath));
  const untrackedFiles = untrackedPaths.map((relativePath) =>
    fileRecord(repoRoot, relativePath)
  );

  return {
    repoRoot,
    head,
    trackedContentSha256: sha256(JSON.stringify(trackedFiles)),
    trackedFiles,
    trackedWorkingDiffSha256: sha256(trackedPatch),
    trackedWorkingPaths,
    untrackedFiles,
  };
}

function writeJson(outputPath, value) {
  const absolutePath = path.resolve(outputPath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
  process.stdout.write(`${absolutePath}\n`);
}

function changedFilePaths(before, after) {
  const beforeByPath = new Map(before.map((file) => [file.path, file]));
  const afterByPath = new Map(after.map((file) => [file.path, file]));
  const paths = new Set([...beforeByPath.keys(), ...afterByPath.keys()]);

  return [...paths].filter(
    (relativePath) =>
      JSON.stringify(beforeByPath.get(relativePath)) !==
      JSON.stringify(afterByPath.get(relativePath))
  );
}

const { command, values } = parseArgs(process.argv.slice(2));
const output = values.get('output');

if (!output) {
  fail('--output is required');
}

if (command === 'capture') {
  writeJson(output, {
    version: 1,
    capturedAt: new Date().toISOString(),
    snapshot: snapshot(process.cwd(), [output]),
  });
  process.exit(0);
}

if (command === 'compare') {
  const baselinePath = values.get('baseline');
  if (!baselinePath) {
    fail('--baseline is required for compare');
  }

  const baseline = JSON.parse(readFileSync(path.resolve(baselinePath), 'utf8'));
  if (baseline.version !== 1 || !baseline.snapshot) {
    fail('unsupported baseline format');
  }

  const current = snapshot(process.cwd(), [baselinePath, output]);
  if (realpathSync(baseline.snapshot.repoRoot) !== current.repoRoot) {
    fail('baseline belongs to a different checkout');
  }

  const headChanged = baseline.snapshot.head !== current.head;
  const trackedContentChanged =
    baseline.snapshot.trackedContentSha256 !== current.trackedContentSha256;
  const workingDiffChanged =
    baseline.snapshot.trackedWorkingDiffSha256 !==
    current.trackedWorkingDiffSha256;
  const untrackedChanged =
    JSON.stringify(baseline.snapshot.untrackedFiles) !==
    JSON.stringify(current.untrackedFiles);
  const changedPaths = [
    ...new Set([
      ...changedFilePaths(baseline.snapshot.trackedFiles, current.trackedFiles),
      ...changedFilePaths(
        baseline.snapshot.untrackedFiles,
        current.untrackedFiles
      ),
    ]),
  ].sort();

  writeJson(output, {
    version: 1,
    comparedAt: new Date().toISOString(),
    baselinePath: path.resolve(baselinePath),
    producedFileDiff: trackedContentChanged || untrackedChanged,
    changedPaths,
    headChanged,
    trackedContentChanged,
    workingDiffChanged,
    untrackedChanged,
    baseline: baseline.snapshot,
    current,
  });
  process.exit(0);
}

fail('command must be capture or compare');
