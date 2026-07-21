import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const proofInputsScript = fileURLToPath(import.meta.url);
const appBuildScript = path.join(scriptRoot, 'build-app-if-stale.mjs');
const browserBuildScript = path.join(scriptRoot, 'build-browser-if-stale.mjs');
const browserRunnerScript = path.join(scriptRoot, 'run-plite-browser.mjs');
const browserServerScript = path.join(scriptRoot, 'serve.mjs');
const boundedProcessScript = path.join(
  scriptRoot,
  '../../../tooling/scripts/run-bounded-process.mjs'
);

export const appRoot = path.resolve(scriptRoot, '..');
export const repoRoot = path.resolve(appRoot, '../..');

const plitePackageNames = [
  'browser',
  'core',
  'plite',
  'plite-dom',
  'plite-history',
  'plite-hyperscript',
  'plite-layout',
  'plite-react',
  'yjs',
];

const udecodePackageNames = ['react-hotkeys', 'react-utils', 'utils'];

const packageBuildEntries = (packageRoot) => [
  path.join(packageRoot, 'src'),
  path.join(packageRoot, 'package.json'),
  path.join(packageRoot, 'tsconfig.json'),
  path.join(packageRoot, 'tsconfig.build.json'),
  path.join(packageRoot, 'tsdown.config.mts'),
  path.join(packageRoot, 'tsdown.config.ts'),
];

const pliteToolchainEntries = [
  path.join(repoRoot, 'tsconfig.json'),
  path.join(repoRoot, 'tooling/config/tsconfig.base.json'),
  path.join(repoRoot, 'tooling/config/tsconfig.build.json'),
  path.join(repoRoot, 'tooling/config/tsdown.config.ts'),
  path.join(repoRoot, 'tooling/config/plite-dts.config.mts'),
  path.join(repoRoot, 'tooling/scripts/build-plite-package.mjs'),
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
  path.join(repoRoot, 'apps/www/src/registry/hooks/use-mounted.ts'),
  path.join(repoRoot, 'apps/www/src/types'),
  path.join(repoRoot, 'apps/www/src/utils/cn.ts'),
  path.join(repoRoot, 'package.json'),
  path.join(repoRoot, 'postcss.config.mjs'),
  path.join(repoRoot, 'pnpm-lock.yaml'),
  path.join(repoRoot, 'pnpm-workspace.yaml'),
  ...pliteToolchainEntries,
  ...plitePackageNames.flatMap((packageName) => {
    const packageRoot = path.join(repoRoot, 'packages', packageName);

    return packageBuildEntries(packageRoot);
  }),
  ...udecodePackageNames.flatMap((packageName) => {
    const packageRoot = path.join(repoRoot, 'packages', 'udecode', packageName);

    return packageBuildEntries(packageRoot);
  }),
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
  path.join(appRoot, 'scripts/plite-browser-runner.mjs'),
  proofInputsScript,
  path.join(repoRoot, 'packages/browser/dist'),
  path.join(repoRoot, 'package.json'),
].filter(fs.existsSync);

const ignoredDirectories = new Set([
  '.next',
  '.tmp',
  'dist',
  'node_modules',
  'out',
  'test-results',
]);

const isInside = (candidate, root) => {
  const relative = path.relative(root, candidate);

  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..')
  );
};

const hasIgnoredDirectory = (candidate, root) => {
  const relative = path.relative(root, candidate);

  return relative
    .split(path.sep)
    .some((segment) => ignoredDirectories.has(segment));
};

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
    .sort();
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
    [...names].sort().map((name) => [name, environment[name] ?? null])
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
    const { fingerprint } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    return typeof fingerprint === 'string' ? fingerprint : null;
  } catch {
    return null;
  }
};

export const hashEntries = (entries, salts = []) => {
  const hash = createHash('sha256');
  const files = [...new Set(entries.flatMap(collectFiles))].sort();

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

const collectDirectories = (entryPath) => {
  if (!fs.existsSync(entryPath)) return [];

  const stat = fs.statSync(entryPath);

  if (!stat.isDirectory()) return [];

  return [
    entryPath,
    ...fs.readdirSync(entryPath, { withFileTypes: true }).flatMap((entry) => {
      if (!entry.isDirectory() || ignoredDirectories.has(entry.name)) {
        return [];
      }

      return collectDirectories(path.join(entryPath, entry.name));
    }),
  ];
};

const minimizeDirectoryRoots = (directories) => {
  const roots = [
    ...new Set(directories.map((entry) => path.resolve(entry))),
  ].sort(
    (left, right) => left.length - right.length || left.localeCompare(right)
  );

  return roots.filter(
    (candidate, index) =>
      !roots.slice(0, index).some((root) => isInside(candidate, root))
  );
};

const watchDirectory = ({ directory, onChange, recursive }) => {
  try {
    return [fs.watch(directory, { recursive }, onChange)];
  } catch (error) {
    if (!recursive || error?.code !== 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM') {
      throw error;
    }

    return collectDirectories(directory).map((nestedDirectory) =>
      fs.watch(nestedDirectory, (eventType, filename) =>
        onChange(
          eventType,
          filename === null
            ? null
            : path.relative(
                directory,
                path.join(nestedDirectory, filename.toString())
              )
        )
      )
    );
  }
};

/**
 * Watches proof inputs between the runner's byte-level start and end checks.
 * A sticky change records transient edits even when their final bytes are restored.
 */
export const createProofIntegrityMonitor = ({
  sourceEntries,
  sourceIgnoredPaths = [],
  targetIgnoredPaths = [],
  targetRoot,
}) => {
  let firstChange = null;
  const watchers = [];
  const ignoredSourcePaths = new Set(
    sourceIgnoredPaths.map((entry) => path.resolve(entry))
  );
  const ignoredTargetPaths = new Set(
    targetIgnoredPaths.map((entry) => path.resolve(entry))
  );
  const markChanged = (kind, changedPath, eventType) => {
    firstChange ??= {
      eventType,
      kind,
      path: changedPath,
    };
  };
  const sourceDirectories = [];
  const sourceFilesByDirectory = new Map();

  for (const entry of new Set(
    sourceEntries.map((value) => path.resolve(value))
  )) {
    if (!fs.existsSync(entry)) continue;

    if (fs.statSync(entry).isDirectory()) {
      sourceDirectories.push(entry);
      continue;
    }

    const directory = path.dirname(entry);
    const files = sourceFilesByDirectory.get(directory) ?? new Set();

    files.add(entry);
    sourceFilesByDirectory.set(directory, files);
  }

  for (const root of minimizeDirectoryRoots(sourceDirectories)) {
    const ignoredPaths = new Set(
      [...ignoredSourcePaths].filter((entry) => isInside(entry, root))
    );
    let watchedSnapshot =
      ignoredPaths.size > 0
        ? snapshotEntriesExcept([root], ignoredPaths)
        : null;
    const onChange = (eventType, filename) => {
      const filenameText = filename?.toString();
      const changedPath =
        !filenameText || filenameText === path.basename(root)
          ? root
          : path.resolve(root, filenameText);

      if (watchedSnapshot !== null) {
        const nextSnapshot = snapshotEntriesExcept([root], ignoredPaths);

        if (nextSnapshot === watchedSnapshot) return;
        watchedSnapshot = nextSnapshot;
      }

      if (
        ignoredSourcePaths.has(changedPath) ||
        hasIgnoredDirectory(changedPath, root)
      ) {
        return;
      }

      markChanged('source', changedPath, eventType);
    };

    watchers.push(
      ...watchDirectory({ directory: root, onChange, recursive: true })
    );
  }

  for (const [directory, files] of sourceFilesByDirectory) {
    if (
      [...files].every((file) =>
        sourceDirectories.some((root) => isInside(file, root))
      )
    ) {
      continue;
    }

    const onChange = (eventType, filename) => {
      if (filename === null) {
        markChanged('source', directory, eventType);
        return;
      }

      const changedPath = path.resolve(directory, filename.toString());

      if (files.has(changedPath) && !ignoredSourcePaths.has(changedPath)) {
        markChanged('source', changedPath, eventType);
      }
    };

    watchers.push(...watchDirectory({ directory, onChange, recursive: false }));
  }

  if (targetRoot && fs.existsSync(targetRoot)) {
    const resolvedTargetRoot = path.resolve(targetRoot);
    const ignoredPaths = new Set(
      [...ignoredTargetPaths].filter((entry) =>
        isInside(entry, resolvedTargetRoot)
      )
    );
    let watchedSnapshot =
      ignoredPaths.size > 0
        ? snapshotEntriesExcept([resolvedTargetRoot], ignoredPaths)
        : null;
    const onChange = (eventType, filename) => {
      const filenameText = filename?.toString();
      const changedPath =
        !filenameText || filenameText === path.basename(resolvedTargetRoot)
          ? resolvedTargetRoot
          : path.resolve(resolvedTargetRoot, filenameText);

      if (watchedSnapshot !== null) {
        const nextSnapshot = snapshotEntriesExcept(
          [resolvedTargetRoot],
          ignoredPaths
        );

        if (nextSnapshot === watchedSnapshot) return;
        watchedSnapshot = nextSnapshot;
      }

      if (ignoredTargetPaths.has(changedPath)) return;

      markChanged('target', changedPath, eventType);
    };

    watchers.push(
      ...watchDirectory({
        directory: resolvedTargetRoot,
        onChange,
        recursive: true,
      })
    );
  }

  for (const watcher of watchers) {
    watcher.on('error', (error) => {
      markChanged('monitor', error.message, 'error');
    });
  }

  return {
    checkpoint: async () => {
      await new Promise((resolve) => setImmediate(resolve));

      return firstChange;
    },
    close: () => {
      for (const watcher of watchers) watcher.close();
    },
    get change() {
      return firstChange;
    },
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
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
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
