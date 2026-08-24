import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const proofInputsScript = fileURLToPath(import.meta.url);
const appBuildScript = path.join(scriptRoot, 'build-app-if-stale.mjs');
const browserBuildScript = path.join(scriptRoot, 'build-browser-if-stale.mjs');
const browserRunnerScript = path.join(scriptRoot, 'run-plite-browser.mjs');
const browserServerScript = path.join(scriptRoot, 'serve.mjs');
const browserStaticServerScript = path.join(
  scriptRoot,
  'plite-static-server.mjs'
);
const boundedProcessScript = path.join(
  scriptRoot,
  '../../../tooling/scripts/run-bounded-process.mjs'
);

export const appRoot = path.resolve(scriptRoot, '..');
export const repoRoot = path.resolve(appRoot, '../..');
const packagesRoot = path.join(repoRoot, 'packages');

const packageBuildEntries = (packageRoot) => [
  path.join(packageRoot, 'src'),
  path.join(packageRoot, 'package.json'),
  path.join(packageRoot, 'tsconfig.json'),
  path.join(packageRoot, 'tsconfig.build.json'),
  path.join(packageRoot, 'tsdown.config.mts'),
  path.join(packageRoot, 'tsdown.config.ts'),
];

const workspacePackageBuildEntries = fs
  .readdirSync(packagesRoot, { withFileTypes: true })
  .flatMap((entry) => {
    if (!entry.isDirectory()) return [];
    const packageRoot = path.join(packagesRoot, entry.name);

    if (entry.name !== 'udecode') {
      return packageBuildEntries(packageRoot);
    }

    return fs
      .readdirSync(packageRoot, { withFileTypes: true })
      .filter((child) => child.isDirectory())
      .flatMap((child) =>
        packageBuildEntries(path.join(packageRoot, child.name))
      );
  });

const pliteToolchainEntries = [
  path.join(repoRoot, 'tsconfig.json'),
  path.join(repoRoot, 'tooling/config/tsconfig.base.json'),
  path.join(repoRoot, 'tooling/config/tsconfig.build.json'),
  path.join(repoRoot, 'tooling/config/direct-package.config.mts'),
  path.join(repoRoot, 'tooling/config/tsdown.config.ts'),
  path.join(repoRoot, 'tooling/scripts/check-package-build-artifacts.mjs'),
];

export const appBuildEntries = [
  appBuildScript,
  boundedProcessScript,
  proofInputsScript,
  path.join(appRoot, 'src'),
  path.join(appRoot, 'next.config.ts'),
  path.join(appRoot, 'package.json'),
  path.join(appRoot, 'tsconfig.json'),
  path.join(repoRoot, 'apps/www/package.json'),
  path.join(repoRoot, 'apps/www/tsconfig.json'),
  path.join(repoRoot, 'apps/www/postcss.config.js'),
  path.join(repoRoot, 'apps/www/src/app/(app)/examples/plite'),
  path.join(repoRoot, 'apps/www/src/app/globals.css'),
  path.join(repoRoot, 'apps/www/src/components/icons.tsx'),
  path.join(repoRoot, 'apps/www/src/components/ui'),
  path.join(repoRoot, 'apps/www/src/components/preview-dev-overlay-styles.tsx'),
  path.join(repoRoot, 'apps/www/src/components/themed-syntax-highlighter.tsx'),
  path.join(repoRoot, 'apps/www/src/hooks/use-copy-to-clipboard.ts'),
  path.join(repoRoot, 'apps/www/src/hooks/use-mobile.ts'),
  path.join(repoRoot, 'apps/www/src/lib/utils.ts'),
  path.join(
    repoRoot,
    'apps/www/src/registry/components/editor/basic-blocks.tsx'
  ),
  path.join(
    repoRoot,
    'apps/www/src/registry/components/editor/basic-marks.tsx'
  ),
  path.join(
    repoRoot,
    'apps/www/src/registry/components/editor/basic-nodes.tsx'
  ),
  path.join(repoRoot, 'apps/www/src/registry/examples/collaboration-demo.tsx'),
  path.join(repoRoot, 'apps/www/src/registry/hooks/use-mounted.ts'),
  path.join(repoRoot, 'apps/www/src/registry/components/editor/blockquote.tsx'),
  path.join(repoRoot, 'apps/www/src/registry/components/editor/code.tsx'),
  path.join(repoRoot, 'apps/www/src/registry/components/editor/editor.tsx'),
  path.join(repoRoot, 'apps/www/src/registry/components/editor/heading.tsx'),
  path.join(repoRoot, 'apps/www/src/registry/components/editor/highlight.tsx'),
  path.join(
    repoRoot,
    'apps/www/src/registry/components/editor/horizontal-rule.tsx'
  ),
  path.join(repoRoot, 'apps/www/src/registry/components/editor/kbd.tsx'),
  path.join(repoRoot, 'apps/www/src/registry/components/editor/paragraph.tsx'),
  path.join(
    repoRoot,
    'apps/www/src/registry/components/editor/remote-cursor-overlay.tsx'
  ),
  path.join(repoRoot, 'apps/www/src/types'),
  path.join(repoRoot, 'apps/www/src/utils/cn.ts'),
  path.join(repoRoot, 'package.json'),
  path.join(repoRoot, 'postcss.config.mjs'),
  path.join(repoRoot, 'pnpm-lock.yaml'),
  path.join(repoRoot, 'pnpm-workspace.yaml'),
  ...pliteToolchainEntries,
  ...workspacePackageBuildEntries,
].filter(fs.existsSync);

export const browserBuildEntries = [
  browserBuildScript,
  boundedProcessScript,
  proofInputsScript,
  ...packageBuildEntries(path.join(repoRoot, 'packages/browser')),
  ...pliteToolchainEntries,
  path.join(repoRoot, 'package.json'),
  path.join(repoRoot, 'pnpm-lock.yaml'),
].filter(fs.existsSync);

export const browserPlanEntries = [
  path.join(appRoot, 'tests/plite-browser'),
  path.join(appRoot, 'playwright.config.ts'),
  path.join(appRoot, 'package.json'),
  path.join(appRoot, 'scripts/plite-browser-runner.mjs'),
  browserRunnerScript,
  proofInputsScript,
  path.join(repoRoot, 'pnpm-lock.yaml'),
].filter(fs.existsSync);

export const browserRunEntries = [
  ...appBuildEntries,
  ...browserBuildEntries,
  ...browserPlanEntries,
  browserRunnerScript,
  browserServerScript,
  browserStaticServerScript,
  path.join(appRoot, 'scripts/plite-browser-runner.mjs'),
  proofInputsScript,
  path.join(repoRoot, 'packages/browser/dist'),
  path.join(repoRoot, 'package.json'),
];

const ignoredDirectories = new Set([
  '.next',
  '.tmp',
  'dist',
  'node_modules',
  'out',
  'test-results',
]);

const collectFiles = (entryPath) => {
  if (!fs.existsSync(entryPath)) return [];

  const stat = fs.statSync(entryPath);

  if (!stat.isDirectory()) return [entryPath];

  return fs.readdirSync(entryPath, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];

    return collectFiles(path.join(entryPath, entry.name));
  });
};

const snapshotEntriesExcept = (entries, excludedPaths) => {
  const files = [...new Set(entries.flatMap(collectFiles))]
    .filter((file) => !excludedPaths.has(path.resolve(file)))
    .sort(compareStrings);
  const hash = createHash('sha256');

  for (const file of files) {
    const stat = fs.statSync(file);

    hash.update(`${path.relative(repoRoot, file).split(path.sep).join('/')}\0`);
    hash.update(`${stat.size}\0${stat.mtimeMs}\0`);
  }

  return hash.digest('hex');
};

export const snapshotEntries = (entries) =>
  snapshotEntriesExcept(entries, new Set());

export const snapshotEnvironment = (names, environment = process.env) =>
  Object.fromEntries(
    [...names]
      .sort(compareStrings)
      .map((name) => [name, environment[name] ?? null])
  );

export const snapshotEnvironmentByPrefix = (
  prefix,
  environment = process.env
) =>
  Object.fromEntries(
    Object.entries(environment)
      .filter(([name]) => name.startsWith(prefix))
      .sort(([left], [right]) => left.localeCompare(right))
  );

export const snapshotFileIdentity = (file) => {
  const resolved = path.resolve(file);

  try {
    const stat = fs.statSync(resolved);

    return {
      mtimeMs: stat.mtimeMs,
      path: resolved,
      size: stat.size,
    };
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;

    return { missing: true, path: resolved };
  }
};

export const readManifestFingerprint = (manifestPath) => {
  try {
    const { fingerprint } = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    return typeof fingerprint === 'string' ? fingerprint : null;
  } catch {
    return null;
  }
};

export const hashEntries = (entries, salts = []) => {
  const hash = createHash('sha256');
  const files = [...new Set(entries.flatMap(collectFiles))].sort(
    compareStrings
  );

  for (const salt of salts) {
    hash.update(`salt:${salt}\0`);
  }

  for (const file of files) {
    const content = fs.readFileSync(file);

    hash.update(`${path.relative(repoRoot, file).split(path.sep).join('/')}\0`);
    hash.update(`${content.byteLength}\0`);
    hash.update(content);
    hash.update('\0');
  }

  return hash.digest('hex');
};

export const fingerprintDigest = (digest, salts = []) => {
  const hash = createHash('sha256');

  for (const salt of salts) {
    hash.update(`salt:${salt}\0`);
  }

  return hash.update(`digest:${digest}\0`).digest('hex');
};

const collectMetadata = (entryPath, excludedPaths, entries) => {
  const resolved = path.resolve(entryPath);

  if (excludedPaths.has(resolved)) return;

  let stat;

  try {
    stat = fs.lstatSync(resolved);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      entries.set(resolved, 'missing');
      return;
    }

    throw error;
  }

  entries.set(
    resolved,
    `${stat.mode}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}:${
      stat.isDirectory() ? 'directory' : stat.isSymbolicLink() ? 'link' : 'file'
    }`
  );

  if (!stat.isDirectory()) return;

  for (const entry of fs.readdirSync(resolved, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    collectMetadata(path.join(resolved, entry.name), excludedPaths, entries);
  }
};

const snapshotMetadata = (entries, ignoredPaths) => {
  const excludedPaths = new Set(
    ignoredPaths.map((entry) => path.resolve(entry))
  );
  const snapshot = new Map();

  for (const entry of new Set(entries.map((value) => path.resolve(value)))) {
    collectMetadata(entry, excludedPaths, snapshot);
  }

  return snapshot;
};

const findMetadataChange = (before, after, kind) => {
  const paths = new Set([...before.keys(), ...after.keys()]);

  for (const changedPath of [...paths].sort(compareStrings)) {
    const previous = before.get(changedPath);
    const current = after.get(changedPath);

    if (previous === current) continue;

    return {
      eventType:
        previous === undefined
          ? 'create'
          : current === undefined || current === 'missing'
            ? 'delete'
            : 'update',
      kind,
      path: changedPath,
    };
  }

  return null;
};

/**
 * Verifies proof inputs at deterministic batch boundaries. File and directory
 * metadata catches edit-then-revert and create-then-delete drift without a
 * recursive watcher, while the runner's byte digests remain the final content
 * authority. This avoids FSEvents startup failures and kqueue's per-entry file
 * descriptors on large repositories.
 */
export const createProofIntegrityMonitor = ({
  sourceEntries,
  sourceIgnoredPaths = [],
  targetIgnoredPaths = [],
  targetRoot,
}) => {
  const targetEntries = targetRoot ? [path.resolve(targetRoot)] : [];
  let closed = false;
  let firstChange = null;
  let sourceSnapshot;
  let targetSnapshot;
  const readyPromise = Promise.resolve().then(() => {
    sourceSnapshot = snapshotMetadata(sourceEntries, sourceIgnoredPaths);
    targetSnapshot = snapshotMetadata(targetEntries, targetIgnoredPaths);
  });

  const checkpoint = async () => {
    await readyPromise;

    if (closed || firstChange) return firstChange;

    try {
      const currentTarget = snapshotMetadata(targetEntries, targetIgnoredPaths);
      const targetChange = findMetadataChange(
        targetSnapshot,
        currentTarget,
        'target'
      );

      if (targetChange) {
        firstChange = targetChange;

        return firstChange;
      }

      const currentSource = snapshotMetadata(sourceEntries, sourceIgnoredPaths);
      const sourceChange = findMetadataChange(
        sourceSnapshot,
        currentSource,
        'source'
      );

      if (sourceChange) firstChange = sourceChange;
    } catch (error) {
      firstChange = {
        eventType: 'error',
        kind: 'monitor',
        path: error instanceof Error ? error.message : String(error),
      };
    }

    return firstChange;
  };

  return {
    checkpoint,
    close: async () => {
      closed = true;
      await readyPromise;
    },
    get change() {
      return firstChange;
    },
    get watcherCount() {
      return 0;
    },
    ready: () => readyPromise,
  };
};

const collectOutputEntries = (entryPath) => {
  if (!fs.existsSync(entryPath)) return [];

  const stat = fs.lstatSync(entryPath);

  if (!stat.isDirectory()) return [entryPath];

  return fs
    .readdirSync(entryPath, { withFileTypes: true })
    .flatMap((entry) => collectOutputEntries(path.join(entryPath, entry.name)));
};

export const hashOutputTree = (rootPath, excludedPaths = []) => {
  const resolvedRoot = path.resolve(rootPath);
  const excluded = new Set(excludedPaths.map((entry) => path.resolve(entry)));
  const entries = collectOutputEntries(resolvedRoot)
    .filter((entry) => !excluded.has(path.resolve(entry)))
    .sort();
  const hash = createHash('sha256');
  let totalBytes = 0;

  for (const entry of entries) {
    const stat = fs.lstatSync(entry);
    const relativePath = path
      .relative(resolvedRoot, entry)
      .split(path.sep)
      .join('/');

    hash.update(`${relativePath}\0`);

    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(entry);
      const targetBytes = Buffer.byteLength(target);

      totalBytes += targetBytes;
      hash.update(`symlink:${targetBytes}\0${target}\0`);
      continue;
    }

    if (!stat.isFile()) {
      hash.update(`other:${stat.mode}\0`);
      continue;
    }

    const content = fs.readFileSync(entry);

    totalBytes += content.byteLength;
    hash.update(`file:${content.byteLength}\0`);
    hash.update(content);
    hash.update('\0');
  }

  return {
    digest: hash.digest('hex'),
    fileCount: entries.length,
    totalBytes,
  };
};

const buildIdentity = ({ inputDigest, outputDigest, version }) =>
  createHash('sha256')
    .update(`version:${version}\0`)
    .update(`input:${inputDigest}\0`)
    .update(`output:${outputDigest}\0`)
    .digest('hex');

export const createBuildManifest = ({
  inputDigest,
  manifestPath,
  outputRoot,
  version,
}) => {
  const output = hashOutputTree(outputRoot, [manifestPath]);

  return {
    version,
    fingerprint: buildIdentity({
      inputDigest,
      outputDigest: output.digest,
      version,
    }),
    inputDigest,
    outputDigest: output.digest,
    outputFileCount: output.fileCount,
    outputTotalBytes: output.totalBytes,
  };
};

export const isBuildManifestFresh = ({
  inputDigest,
  manifestPath,
  outputRoot,
  version,
}) => {
  let manifest;

  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    return false;
  }

  if (
    manifest.version !== version ||
    manifest.inputDigest !== inputDigest ||
    typeof manifest.outputDigest !== 'string' ||
    typeof manifest.fingerprint !== 'string'
  ) {
    return false;
  }

  const output = hashOutputTree(outputRoot, [manifestPath]);
  const fingerprint = buildIdentity({
    inputDigest,
    outputDigest: output.digest,
    version,
  });

  return (
    manifest.outputDigest === output.digest &&
    manifest.outputFileCount === output.fileCount &&
    manifest.outputTotalBytes === output.totalBytes &&
    manifest.fingerprint === fingerprint
  );
};
