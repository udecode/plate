import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const sourceExtensions = ['.ts', '.tsx', '.mts', '.js', '.jsx'];

const getRuntimeTarget = (value) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;

  return (
    getRuntimeTarget(value.import) ??
    getRuntimeTarget(value.default) ??
    getRuntimeTarget(value.module)
  );
};

const getPackageRoots = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() || entry.name === 'node_modules') return [];

    const packageRoot = path.join(directory, entry.name);

    return existsSync(path.join(packageRoot, 'package.json'))
      ? [packageRoot]
      : getPackageRoots(packageRoot);
  });

export const getWorkspaceSourceEntries = (repoRoot) => {
  const packagesRoot = path.join(repoRoot, 'packages');

  return getPackageRoots(packagesRoot).flatMap((packageRoot) => {
    const manifest = JSON.parse(
      readFileSync(path.join(packageRoot, 'package.json'), 'utf-8')
    );

    if (typeof manifest.name !== 'string' || !manifest.exports) return [];

    const exportEntries =
      typeof manifest.exports === 'object' &&
      Object.keys(manifest.exports).some((key) => key.startsWith('.'))
        ? Object.entries(manifest.exports)
        : [['.', manifest.exports]];

    return exportEntries.flatMap(([exportKey, packageExport]) => {
      if (exportKey === './package.json') return [];

      const distTarget = getRuntimeTarget(packageExport);

      if (!distTarget?.startsWith('./dist/') || !distTarget.endsWith('.js')) {
        return [];
      }

      const sourceBase = path.join(
        packageRoot,
        distTarget.replace('./dist/', 'src/').slice(0, -3)
      );
      const sourceEntry = sourceExtensions
        .map((extension) => `${sourceBase}${extension}`)
        .find(existsSync);

      if (!sourceEntry) return [];

      return [
        {
          distEntry: path.join(packageRoot, distTarget),
          sourceEntry,
          specifier:
            exportKey === '.'
              ? manifest.name
              : `${manifest.name}${exportKey.slice(1)}`,
        },
      ];
    });
  });
};
