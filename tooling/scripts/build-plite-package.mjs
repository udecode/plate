#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, '..', '..');
const declarationExtensionPattern = /\.d\.(?:c|m)?ts$/;
const runtimeExtensionPattern = /\.(?:c|m)?js$/;
const buildLockFile = '.tmp/plite-build.lock';
const defaultBuildLockTimeoutMs = 10 * 60_000;
const incompleteBuildLockStaleMs = 5000;
const lockPollIntervalMs = 100;
const sleepBuffer = new Int32Array(new SharedArrayBuffer(4));

export function getPliteDeclarationEntries(
  packageJson,
  typesDirectory = '.plite-types'
) {
  const entries = {};

  for (const value of Object.values(packageJson.exports ?? {})) {
    const typesTarget = readTypesTarget(value);

    if (!typesTarget) continue;

    if (!typesTarget.startsWith('./dist/')) {
      throw new Error(`Declaration target must live in ./dist: ${typesTarget}`);
    }

    const outputPath = typesTarget
      .slice('./dist/'.length)
      .replace(declarationExtensionPattern, '');

    if (!outputPath || outputPath === typesTarget) {
      throw new Error(`Unsupported declaration target: ${typesTarget}`);
    }

    entries[outputPath] = join(
      typesDirectory,
      typesTarget.slice('./dist/'.length)
    );
  }

  if (Object.keys(entries).length === 0) {
    throw new Error('Package has no public declaration entries.');
  }

  return entries;
}

export function acquirePliteBuildLock({
  packageRoot = process.cwd(),
  timeoutMs = readBuildLockTimeout(),
} = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Plite build lock timeout must be a positive number.');
  }

  const lockPath = join(packageRoot, buildLockFile);
  const startedAt = Date.now();
  const token = `${process.pid}-${randomUUID()}`;
  const ownerPath = join(lockPath, `${token}.json`);

  mkdirSync(dirname(lockPath), { recursive: true });

  for (;;) {
    try {
      mkdirSync(lockPath, { mode: 0o700 });
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;

      if (removeStaleBuildLock(lockPath)) continue;

      const elapsedMs = Date.now() - startedAt;

      if (elapsedMs >= timeoutMs) {
        throw new Error(
          `Timed out after ${timeoutMs}ms waiting for ${lockPath}.`
        );
      }

      Atomics.wait(
        sleepBuffer,
        0,
        0,
        Math.min(lockPollIntervalMs, timeoutMs - elapsedMs)
      );
      continue;
    }

    try {
      writeFileSync(
        ownerPath,
        `${JSON.stringify({ createdAt: Date.now(), pid: process.pid, token })}\n`,
        { flag: 'wx', mode: 0o600 }
      );
    } catch (error) {
      try {
        rmdirSync(lockPath);
      } catch {}
      throw error;
    }

    let released = false;
    const cleanupOnExit = () => removeOwnedBuildLock(lockPath, ownerPath);
    const release = () => {
      if (released) return;
      released = true;
      process.off('exit', cleanupOnExit);
      removeOwnedBuildLock(lockPath, ownerPath);
    };

    process.once('exit', cleanupOnExit);

    return release;
  }
}

export function withPliteBuildLock(callback, options) {
  const release = acquirePliteBuildLock(options);

  try {
    return callback();
  } finally {
    release();
  }
}

export function buildPlitePackage({ packageRoot = process.cwd() } = {}) {
  return withPliteBuildLock(
    () => {
      const typesDirectory = join(packageRoot, '.plite-types');
      const declarationConfig = join(
        repoRoot,
        'tooling',
        'config',
        'plite-dts.config.mts'
      );

      rmSync(typesDirectory, { force: true, recursive: true });

      try {
        runCommand(
          'pnpm',
          [
            'exec',
            'tsdown',
            '--config',
            './tsdown.config.mts',
            '--log-level',
            'warn',
          ],
          packageRoot
        );
        runCommand(
          'pnpm',
          [
            'exec',
            'tsc',
            '-p',
            'tsconfig.build.json',
            '--outDir',
            relative(packageRoot, typesDirectory).split(sep).join('/'),
          ],
          packageRoot
        );
        runCommand(
          'pnpm',
          [
            'exec',
            'tsdown',
            '--config',
            declarationConfig,
            '--log-level',
            'warn',
          ],
          packageRoot,
          { PLITE_PACKAGE_ROOT: packageRoot }
        );
        assertDeclarationOutputs(packageRoot);
      } finally {
        rmSync(typesDirectory, { force: true, recursive: true });
      }
    },
    { packageRoot }
  );
}

function readBuildLockTimeout() {
  const value = process.env.PLITE_BUILD_LOCK_TIMEOUT_MS;

  if (value === undefined) return defaultBuildLockTimeoutMs;

  const timeoutMs = Number(value);

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(
      'PLITE_BUILD_LOCK_TIMEOUT_MS must be a positive number when set.'
    );
  }

  return timeoutMs;
}

function removeOwnedBuildLock(lockPath, ownerPath) {
  try {
    unlinkSync(ownerPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    return;
  }

  try {
    rmdirSync(lockPath);
  } catch (error) {
    if (!['ENOENT', 'ENOTEMPTY'].includes(error?.code)) throw error;
  }
}

function removeStaleBuildLock(lockPath) {
  let ownerFiles;

  try {
    ownerFiles = readdirSync(lockPath);
  } catch (error) {
    if (error?.code === 'ENOENT') return true;
    throw error;
  }

  if (ownerFiles.length === 0) {
    try {
      if (
        Date.now() - statSync(lockPath).mtimeMs <
        incompleteBuildLockStaleMs
      ) {
        return false;
      }
    } catch (error) {
      if (error?.code === 'ENOENT') return true;
      throw error;
    }

    try {
      rmdirSync(lockPath);
    } catch (error) {
      if (error?.code === 'ENOENT') return true;
      if (error?.code === 'ENOTEMPTY') return false;
      throw error;
    }
    return true;
  }

  const staleOwnerPaths = [];

  for (const ownerFile of ownerFiles) {
    const ownerPath = join(lockPath, ownerFile);
    let owner;

    try {
      owner = JSON.parse(readFileSync(ownerPath, 'utf8'));
    } catch {
      try {
        if (
          Date.now() - statSync(ownerPath).mtimeMs <
          incompleteBuildLockStaleMs
        ) {
          return false;
        }
      } catch (error) {
        if (error?.code === 'ENOENT') return true;
        throw error;
      }

      staleOwnerPaths.push(ownerPath);
      continue;
    }

    if (
      Number.isInteger(owner.pid) &&
      owner.pid > 0 &&
      processIsAlive(owner.pid)
    ) {
      return false;
    }

    staleOwnerPaths.push(ownerPath);
  }

  for (const ownerPath of staleOwnerPaths) {
    try {
      unlinkSync(ownerPath);
    } catch (error) {
      if (error?.code === 'ENOENT') return true;
      throw error;
    }
  }

  try {
    rmdirSync(lockPath);
  } catch (error) {
    if (error?.code === 'ENOENT') return true;
    if (error?.code === 'ENOTEMPTY') return false;
    throw error;
  }
  return true;
}

function processIsAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') return false;
    if (error?.code === 'EPERM') return true;
    throw error;
  }
}

function assertDeclarationOutputs(packageRoot) {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, 'package.json'), 'utf8')
  );
  const missing = Object.keys(getPliteDeclarationEntries(packageJson)).filter(
    (entry) => !existsSync(join(packageRoot, 'dist', `${entry}.d.ts`))
  );

  if (missing.length > 0) {
    throw new Error(
      `Declaration bundler omitted public entries: ${missing.join(', ')}`
    );
  }
}

function readTypesTarget(value) {
  if (typeof value === 'string') {
    return runtimeExtensionPattern.test(value)
      ? value.replace(runtimeExtensionPattern, '.d.ts')
      : null;
  }
  if (!value || typeof value !== 'object') return null;

  if (typeof value.types === 'string') return value.types;

  for (const nestedValue of Object.values(value)) {
    const target = readTypesTarget(nestedValue);

    if (target) return target;
  }

  return null;
}

function runCommand(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });

  if (result.error) throw result.error;

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} exited with ${result.status}`
    );
  }
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return !!entrypoint && resolve(entrypoint) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );

    getPliteDeclarationEntries(packageJson);
    buildPlitePackage();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
