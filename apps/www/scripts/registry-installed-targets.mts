import { posix } from 'node:path';

import type { Registry } from 'shadcn/schema';

const SOURCE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
] as const;

type RegistryFile = NonNullable<Registry['items'][number]['files']>[number];

function addOwner(
  owners: Map<string, Set<string>>,
  path: string,
  owner: string
) {
  const currentOwners = owners.get(path) ?? new Set<string>();
  currentOwners.add(owner);
  owners.set(path, currentOwners);
}

function getPathCandidates(path: string) {
  if (posix.extname(path)) return [path];

  return [
    path,
    ...SOURCE_EXTENSIONS.map((extension) => `${path}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => `${path}/index${extension}`),
  ];
}

function findOwners(owners: Map<string, Set<string>>, path: string) {
  for (const candidate of getPathCandidates(path)) {
    const pathOwners = owners.get(candidate);

    if (pathOwners) return new Set(pathOwners);
  }

  return null;
}

function intersectOwners(
  sourceOwners: Set<string> | null,
  installedOwners: Set<string> | null
) {
  if (!sourceOwners || !installedOwners) return null;

  const owners = new Set(
    [...sourceOwners].filter((owner) => installedOwners.has(owner))
  );

  return owners.size > 0 ? owners : null;
}

export function createRegistryInstalledTargetResolver(registry: Registry) {
  const sourceFileOwners = new Map<string, Set<string>>();
  const installedTargetOwners = new Map<string, Set<string>>();

  for (const item of registry.items) {
    for (const file of item.files ?? []) {
      addOwner(sourceFileOwners, file.path, item.name);
      addOwner(installedTargetOwners, file.target ?? file.path, item.name);

      if (file.target?.startsWith('@components/')) {
        addOwner(installedTargetOwners, file.target.slice(1), item.name);
        addOwner(
          installedTargetOwners,
          `@/components/${file.target.slice('@components/'.length)}`,
          item.name
        );
      }
    }
  }

  const resolveSourceOwners = (file: RegistryFile, specifier: string) => {
    let sourcePath: string | null = null;

    if (specifier.startsWith('@/registry/')) {
      sourcePath = specifier.slice('@/registry/'.length);
    } else if (specifier.startsWith('.')) {
      sourcePath = posix.normalize(
        posix.join(posix.dirname(file.path), specifier)
      );
    } else if (specifier.startsWith('@/')) {
      const installedOwners = findOwners(installedTargetOwners, specifier);

      if (installedOwners) return installedOwners;

      sourcePath = specifier.slice('@/'.length);
    }

    if (!sourcePath) return null;

    return (
      findOwners(sourceFileOwners, sourcePath) ??
      findOwners(installedTargetOwners, sourcePath)
    );
  };

  const resolveInstalledRelativeOwners = (
    file: RegistryFile,
    specifier: string
  ) => {
    if (!specifier.startsWith('.')) return null;

    const installedPath = file.target ?? file.path;
    const importedPath = posix.normalize(
      posix.join(posix.dirname(installedPath), specifier)
    );

    return findOwners(installedTargetOwners, importedPath);
  };

  return {
    resolveCopiedOwners(file: RegistryFile, specifier: string) {
      const sourceOwners = resolveSourceOwners(file, specifier);

      if (!specifier.startsWith('.')) return sourceOwners;

      return intersectOwners(
        sourceOwners,
        resolveInstalledRelativeOwners(file, specifier)
      );
    },
    resolveInstalledRelativeOwners,
    resolveSourceOwners,
  };
}
