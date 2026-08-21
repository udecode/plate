import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const RECEIPT_FIELDS = [
  'caseId',
  'attempt',
  'claim',
  'command',
  'result',
  'ref',
  'inputDigest',
  'inputCount',
  'inputs',
  'host',
  'latestInputMtime',
  'proofStarted',
  'proofEnded',
  'retries',
];

const sha256 = (value) =>
  createHash('sha256').update(value).digest('hex');

const comparePaths = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

export const snapshotProofInputs = (rootDir, inputPaths) => {
  if (new Set(inputPaths).size !== inputPaths.length) {
    throw new Error('receipt inputs must be unique');
  }

  const entries = inputPaths
    .map((inputPath) => {
      const absolutePath = resolve(rootDir, inputPath);
      const relativePath = relative(rootDir, absolutePath);

      if (
        relativePath.startsWith('..') ||
        !relativePath ||
        !existsSync(absolutePath)
      ) {
        throw new Error(`input must be an existing repo file: ${inputPath}`);
      }

      const stat = statSync(absolutePath);

      if (!stat.isFile()) throw new Error(`input must be a file: ${inputPath}`);

      return {
        hash: sha256(readFileSync(absolutePath)),
        mtimeMs: stat.mtimeMs,
        path: relativePath,
      };
    })
    .sort((left, right) => comparePaths(left.path, right.path));
  const canonical = entries
    .map((entry) => `${entry.path}\0${entry.hash}`)
    .join('\n');

  return {
    digest: `sha256:${sha256(canonical)}`,
    entries,
    latestMtime: new Date(
      Math.max(...entries.map((entry) => entry.mtimeMs))
    ).toISOString(),
  };
};

export const createInputDigest = (rootDir, inputPaths) =>
  snapshotProofInputs(rootDir, inputPaths).digest;

export const createProofReceiptId = (receipt) => {
  const canonical = RECEIPT_FIELDS.map(
    (field) => `${field}=${receipt[field] ?? ''}`
  ).join('\n');

  return `sha256:${sha256(canonical)}`;
};
