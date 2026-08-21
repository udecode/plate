#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createProofReceiptId,
  snapshotProofInputs,
} from './proof-receipt-contract.mjs';

const findRepoRoot = (start) => {
  let current = resolve(start);

  while (true) {
    if (existsSync(join(current, 'AGENTS.md'))) return current;

    const parent = dirname(current);

    if (parent === current) {
      throw new Error('could not find repo root containing AGENTS.md');
    }
    current = parent;
  }
};

const readFlagValue = (args, index, flag) => {
  const value = args[index + 1];

  if (!value || value === '--' || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }

  return value;
};

const parseArgs = (argv) => {
  const separator = argv.indexOf('--');

  if (separator === -1 || separator === argv.length - 1) {
    throw new Error('proof command must follow --');
  }

  const flags = argv.slice(0, separator);
  const parsed = { caseIds: [], inputs: [] };

  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];
    const value = readFlagValue(flags, index, flag);

    switch (flag) {
      case '--attempt':
        parsed.attempt = value;
        break;
      case '--base-url':
        parsed.baseUrl = value;
        break;
      case '--browser':
        parsed.browser = value;
        break;
      case '--case-id':
        parsed.caseIds.push(value);
        break;
      case '--claim':
        parsed.claim = value;
        break;
      case '--host':
        parsed.host = value;
        break;
      case '--host-pid':
        parsed.hostPid = value;
        break;
      case '--input':
        parsed.inputs.push(value);
        break;
      case '--retries':
        parsed.retries = value;
        break;
      default:
        throw new Error(`unknown flag ${flag}`);
    }

    index += 1;
  }

  parsed.command = argv.slice(separator + 1);

  return parsed;
};

const assertArgs = (args) => {
  if (args.caseIds.length === 0) throw new Error('--case-id is required');
  if (args.inputs.length === 0) throw new Error('--input is required');
  if (!/^[1-9]\d*$/.test(args.attempt ?? '')) {
    throw new Error('--attempt must be a positive integer');
  }
  if (!['candidate-local', 'kept', 'completed'].includes(args.claim)) {
    throw new Error('--claim must be candidate-local, kept, or completed');
  }
  if (!/^\d+$/.test(args.retries ?? '')) {
    throw new Error('--retries must be a non-negative integer');
  }

  const hostNone = /^none:\s*\S/i.test(args.host ?? '');
  const managedHost = args.hostPid && args.baseUrl && args.browser;

  if (!hostNone && !managedHost) {
    throw new Error(
      'use --host "none: <reason>" or provide --host-pid, --base-url, and --browser'
    );
  }
};

const runGit = (rootDir, args) =>
  spawnSync('git', args, { cwd: rootDir, encoding: 'utf8' });

const getRef = (rootDir, entries) => {
  const headResult = runGit(rootDir, ['rev-parse', 'HEAD']);

  if (headResult.status !== 0) {
    throw new Error(headResult.stderr || 'git rev-parse HEAD failed');
  }

  const head = headResult.stdout.trim();
  let dirty = false;

  for (const entry of entries) {
    const tracked = runGit(rootDir, [
      'ls-files',
      '--error-unmatch',
      '--',
      entry.path,
    ]);

    if (tracked.status !== 0) {
      dirty = true;
      continue;
    }

    const working = runGit(rootDir, ['diff', '--quiet', '--', entry.path]);
    const staged = runGit(rootDir, [
      'diff',
      '--cached',
      '--quiet',
      '--',
      entry.path,
    ]);

    if (working.status !== 0 || staged.status !== 0) dirty = true;
  }

  return `${dirty ? 'dirty' : 'commit'}:${head}`;
};

const getHost = (args) => {
  if (/^none:\s*\S/i.test(args.host ?? '')) {
    return `host:none - ${args.host.replace(/^none:\s*/i, '')}`;
  }

  const pid = Number.parseInt(args.hostPid, 10);

  if (!Number.isInteger(pid) || pid < 1) {
    throw new Error('--host-pid must be a positive integer');
  }

  try {
    process.kill(pid, 0);
  } catch {
    throw new Error(`host process ${pid} is not running`);
  }

  const startedResult = spawnSync('ps', ['-o', 'lstart=', '-p', String(pid)], {
    encoding: 'utf8',
  });
  const started = new Date(startedResult.stdout.trim());

  if (startedResult.status !== 0 || Number.isNaN(started.getTime())) {
    throw new Error(`could not resolve start time for host process ${pid}`);
  }

  return `pid:${pid};started:${started.toISOString()};base-url:${args.baseUrl};browser:${args.browser}`;
};

const safeCell = (value) =>
  String(value).replaceAll('|', '\\u007c').replace(/[\r\n]+/g, ' ').trim();

const commandCell = (command) =>
  safeCell(command.map((part) => JSON.stringify(part)).join(' '));

const sameSnapshot = (left, right) =>
  left.digest === right.digest &&
  left.entries.length === right.entries.length &&
  left.entries.every(
    (entry, index) =>
      entry.path === right.entries[index].path &&
      entry.hash === right.entries[index].hash
  );

export const captureProofReceipt = (args, { cwd = process.cwd() } = {}) => {
  assertArgs(args);

  const rootDir = findRepoRoot(cwd);
  const before = snapshotProofInputs(rootDir, args.inputs);
  const ref = getRef(rootDir, before.entries);
  const host = getHost(args);
  const proofStarted = new Date();
  const startedAt = performance.now();
  const result = spawnSync(args.command[0], args.command.slice(1), {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
  });
  const durationMs = Math.round(performance.now() - startedAt);
  const proofEnded = new Date();

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`proof command failed with exit ${result.status}`);
  }

  const after = snapshotProofInputs(rootDir, args.inputs);

  if (!sameSnapshot(before, after)) {
    throw new Error('proof inputs changed while the command ran');
  }

  return args.caseIds.map((caseId) => {
    const receipt = {
      attempt: String(args.attempt),
      caseId: safeCell(caseId),
      claim: args.claim,
      command: commandCell(args.command),
      host: safeCell(host),
      inputCount: String(before.entries.length),
      inputDigest: before.digest,
      inputs: before.entries.map((entry) => entry.path).join(','),
      latestInputMtime: before.latestMtime,
      proofEnded: proofEnded.toISOString(),
      proofStarted: proofStarted.toISOString(),
      ref,
      result: `pass: exit 0 in ${durationMs}ms`,
      retries: String(args.retries),
    };
    const receiptId = createProofReceiptId(receipt);

    return `| ${receipt.caseId} | ${receipt.attempt} | ${receipt.claim} | ${receipt.command} | ${receipt.result} | ${receipt.ref} | ${receipt.inputDigest} | ${receipt.inputCount} | ${receipt.inputs} | ${receipt.host} | ${receipt.latestInputMtime} | ${receipt.proofStarted} | ${receipt.proofEnded} | ${receipt.retries} | ${receiptId} |`;
  });
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const rows = captureProofReceipt(args);

    process.stdout.write(`${rows.join('\n')}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  }
}
