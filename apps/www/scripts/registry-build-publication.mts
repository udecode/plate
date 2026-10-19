import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

export type RegistryBuildLock = {
  pid: number;
  sourceIdentity: string;
  startedAt: string;
  token: string;
};

type PublishTarget = {
  destination: string;
  staged: string;
};

const sha256 = (value: string | Buffer) =>
  createHash('sha256').update(value).digest('hex');

async function exists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}

async function readLock(lockPath: string) {
  return JSON.parse(await readFile(lockPath, 'utf-8')) as RegistryBuildLock;
}

function isProcessAlive(pid: number) {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
}

export async function acquireRegistryBuildLock({
  buildRoot,
  sourceIdentity,
}: {
  buildRoot: string;
  sourceIdentity: string;
}) {
  await mkdir(buildRoot, { recursive: true });
  const lockPath = path.join(buildRoot, 'lock');
  const lock: RegistryBuildLock = {
    pid: process.pid,
    sourceIdentity,
    startedAt: new Date().toISOString(),
    token: randomUUID(),
  };

  try {
    await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, {
      flag: 'wx',
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;

    const owner = await readLock(lockPath);
    throw new Error(
      `Registry build lock is owned by pid ${owner.pid} with token ${owner.token}. If that process is dead, run pnpm --filter www build:registry --recover-lock ${owner.token}.`,
      { cause: error }
    );
  }

  const stageDir = path.join(buildRoot, `run-${lock.token}`);
  await mkdir(stageDir);

  return { lock, lockPath, stageDir };
}

export async function releaseRegistryBuildLock({
  lock,
  lockPath,
  stageDir,
}: {
  lock: RegistryBuildLock;
  lockPath: string;
  stageDir: string;
}) {
  const owner = await readLock(lockPath).catch(() => null);

  if (owner?.token !== lock.token) {
    throw new Error('Registry build lock ownership changed before release.');
  }

  await rm(stageDir, { force: true, recursive: true });
  await rm(lockPath);
}

export async function recoverRegistryBuildLock({
  buildRoot,
  token,
}: {
  buildRoot: string;
  token: string;
}) {
  const lockPath = path.join(buildRoot, 'lock');
  const owner = await readLock(lockPath);

  if (owner.token !== token) {
    throw new Error('Registry build recovery token does not own the lock.');
  }
  if (isProcessAlive(owner.pid)) {
    throw new Error(`Registry build pid ${owner.pid} is still alive.`);
  }

  await rm(path.join(buildRoot, `run-${owner.token}`), {
    force: true,
    recursive: true,
  });
  await rm(lockPath);
}

async function listFiles(directory: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const relativePath = path.posix.join(prefix, entry.name);

        return entry.isDirectory()
          ? listFiles(path.join(directory, entry.name), relativePath)
          : [relativePath];
      })
  );

  return files.flat();
}

export async function fingerprintRegistryDirectory(directory: string) {
  const files = await listFiles(directory);
  const fingerprints = await Promise.all(
    files.map(async (relativePath) => [
      relativePath,
      sha256(await readFile(path.join(directory, relativePath))),
    ])
  );

  return Object.fromEntries(fingerprints) as Record<string, string>;
}

export function createRegistryGeneration(
  payloads: Record<string, string>,
  sourceIdentity: string
) {
  return sha256(JSON.stringify({ payloads, sourceIdentity }));
}

async function replaceTarget(target: PublishTarget, token: string) {
  if (!(await exists(target.staged))) {
    throw new Error(`Missing staged registry target: ${target.staged}`);
  }

  await mkdir(path.dirname(target.destination), { recursive: true });
  const backup = `${target.destination}.backup-${token}`;
  const hadDestination = await exists(target.destination);

  if (hadDestination) await rename(target.destination, backup);
  try {
    await rename(target.staged, target.destination);
  } catch (error) {
    if (hadDestination) await rename(backup, target.destination);
    throw error;
  }

  return { backup, hadDestination, target };
}

export async function publishRegistryGeneration({
  marker,
  targets,
  token,
}: {
  marker: PublishTarget;
  targets: PublishTarget[];
  token: string;
}) {
  const published: Array<Awaited<ReturnType<typeof replaceTarget>>> = [];

  try {
    for (const target of targets) {
      published.push(await replaceTarget(target, token));
    }
    published.push(await replaceTarget(marker, token));
  } catch (error) {
    for (const entry of published.toReversed()) {
      await rm(entry.target.destination, { force: true, recursive: true });
      if (entry.hadDestination) {
        await rename(entry.backup, entry.target.destination);
      }
    }
    throw error;
  }

  await Promise.all(
    published
      .filter(({ hadDestination }) => hadDestination)
      .map(({ backup }) => rm(backup, { force: true, recursive: true }))
  );
}
