import { createHash, randomUUID } from 'node:crypto';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  realpathSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const stateRoots = new Map<string, string>();

const fingerprint = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 32);

const existingAncestor = (path: string) => {
  let candidate = path;

  while (!existsSync(candidate)) {
    const parent = dirname(candidate);

    if (parent === candidate) return candidate;
    candidate = parent;
  }

  return candidate;
};

export const findProjectRoot = (path: string) => {
  let directory = dirname(resolve(path));

  while (dirname(directory) !== directory) {
    if (existsSync(join(directory, 'package.json'))) return directory;
    directory = dirname(directory);
  }

  return dirname(resolve(path));
};

const usableStateRoot = (path: string, device: number) => {
  let descriptor: number | undefined;
  const probe = join(path, `.write-${process.pid}-${randomUUID()}`);

  try {
    mkdirSync(path, { mode: 0o700, recursive: true });
    if (!statSync(path).isDirectory() || statSync(path).dev !== device) return;
    descriptor = openSync(probe, 'wx', 0o600);

    return path;
  } catch {
  } finally {
    if (descriptor !== undefined) {
      closeSync(descriptor);
      rmSync(probe, { force: true });
    }
  }
};

/** Private durable state on the artifact filesystem, never in tracked source. */
export const artifactStateRoot = (artifactPath: string) => {
  const projectRoot = realpathSync(findProjectRoot(artifactPath));
  const artifactDirectory = existingAncestor(dirname(artifactPath));
  const artifactDevice = statSync(artifactDirectory).dev;
  const cacheKey = `${projectRoot}\0${artifactDevice}`;
  const cached = stateRoots.get(cacheKey);

  if (cached) return cached;
  const projectCache = join(
    projectRoot,
    'node_modules',
    '.cache',
    'plate',
    'state'
  );
  const statePath =
    statSync(existingAncestor(projectCache)).dev === artifactDevice
      ? projectCache
      : undefined;
  const root = statePath
    ? usableStateRoot(statePath, artifactDevice)
    : undefined;

  if (!root) {
    throw new Error(
      `Plate could not create private state on the generated artifact filesystem: ${artifactPath}`
    );
  }

  stateRoots.set(cacheKey, root);

  return root;
};

/** Prefix for a private compiler directory created atomically by `mkdtemp`. */
export const compilerDirectoryPrefix = (entryPath: string) =>
  join(
    tmpdir(),
    `plate-compiler-${fingerprint(resolve(entryPath)).slice(0, 12)}-`
  );

export const canonicalPath = (path: string) => {
  const resolved = resolve(path);

  if (existsSync(resolved)) return realpathSync(resolved);
  const ancestor = existingAncestor(dirname(resolved));

  return join(realpathSync(ancestor), resolved.slice(ancestor.length + 1));
};

export const pathFingerprint = (path: string) =>
  fingerprint(canonicalPath(path));
