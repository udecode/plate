import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactDirectory, '../../../..');
const snapshotPath = join(artifactDirectory, 'source-snapshot.tsv');
const closurePath = join(artifactDirectory, 'plugin-source-closure.tsv');
const write = process.argv.includes('--write');

const hashFile = (path) =>
  createHash('sha256')
    .update(readFileSync(resolve(root, path)))
    .digest('hex');

const closurePaths = readFileSync(closurePath, 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => line.split('\t')[1])
  .sort();

if (write) {
  writeFileSync(
    snapshotPath,
    `path\tsha256\n${closurePaths
      .map((path) => `${path}\t${hashFile(path)}`)
      .join('\n')}\n`
  );
}

if (!existsSync(snapshotPath)) {
  throw new Error('Missing source snapshot; run with --write first.');
}

const snapshotRows = readFileSync(snapshotPath, 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => {
    const [path, sha256] = line.split('\t');

    return { path, sha256 };
  });
const snapshotPaths = new Set(snapshotRows.map((row) => row.path));
const changed = snapshotRows
  .filter(
    (row) =>
      !existsSync(resolve(root, row.path)) || hashFile(row.path) !== row.sha256
  )
  .map((row) => row.path);
const added = closurePaths.filter((path) => !snapshotPaths.has(path));
const result = {
  added,
  changed,
  currentClosureFiles: closurePaths.length,
  snapshotFiles: snapshotRows.length,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (added.length > 0 || changed.length > 0) process.exitCode = 1;
