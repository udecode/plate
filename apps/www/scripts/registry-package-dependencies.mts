import { readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { isAbsolute, relative, resolve } from 'node:path';

import type { Registry } from 'shadcn/schema';

import { entrypointDags as defaultEntrypointDags } from '../../../tooling/entrypoints/entrypoint-dag.mjs';
import {
  isImportableRegistrySource,
  parseModuleImports,
  type ModuleImport,
} from './registry-imports.mts';
import { createRegistryInstalledTargetResolver } from './registry-installed-targets.mts';
import {
  intersectPackageVersionRanges,
  packageVersionRangesIntersect,
} from './registry-package-version.mts';

type Entrypoint = {
  dependencies?: readonly string[];
  externalDependencies?: readonly string[];
  peerDependencies?: readonly string[];
  public?: boolean;
};

type EntrypointDags = Record<
  string,
  {
    entrypoints: Record<string, Entrypoint>;
  }
>;

type PackageManifest = {
  exports?: Record<string, unknown>;
  peerDependencies?: Record<string, string>;
};

type DependencyRequirement = {
  context: string;
  range: string | null;
};

export type DeriveRegistryPackageDependenciesOptions = {
  sourceRoot: string;
  entrypointDags?: EntrypointDags;
  hostProvidedAliases?: readonly string[];
  hostProvidedPackages?: readonly string[];
  packageManifests?: Record<string, PackageManifest>;
};

const DEFAULT_HOST_PROVIDED_ALIASES = ['@/lib/utils'] as const;
const DEFAULT_HOST_PROVIDED_PACKAGES = ['react', 'react-dom'] as const;
const NODE_BUILTINS = new Set([
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
]);

function readPackageManifest(path: URL): PackageManifest {
  return JSON.parse(readFileSync(path, 'utf-8')) as PackageManifest;
}

function getDefaultPackageManifests(): Record<string, PackageManifest> {
  return {
    platejs: readPackageManifest(
      new URL('../../../packages/platejs/package.json', import.meta.url)
    ),
    plitejs: readPackageManifest(
      new URL('../../../packages/plitejs/package.json', import.meta.url)
    ),
  };
}

function getPackageName(specifier: string) {
  if (
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('@/') ||
    specifier.startsWith('#') ||
    specifier.includes('://') ||
    NODE_BUILTINS.has(specifier)
  ) {
    return null;
  }
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/');

    return name ? `${scope}/${name}` : specifier;
  }

  return specifier.split('/')[0];
}

function parsePackageDependency(dependency: string) {
  if (dependency.startsWith('@')) {
    const versionSeparator = dependency.indexOf(
      '@',
      dependency.indexOf('/') + 1
    );

    return versionSeparator === -1
      ? { name: dependency, range: null }
      : {
          name: dependency.slice(0, versionSeparator),
          range: dependency.slice(versionSeparator + 1),
        };
  }

  const versionSeparator = dependency.indexOf('@');

  return versionSeparator === -1
    ? { name: dependency, range: null }
    : {
        name: dependency.slice(0, versionSeparator),
        range: dependency.slice(versionSeparator + 1),
      };
}

function getExactEntrypoint(
  specifier: string,
  dags: EntrypointDags,
  { publicOnly }: { publicOnly: boolean }
) {
  for (const [packageName, definition] of Object.entries(dags)) {
    const entrypointName =
      specifier === packageName
        ? 'root'
        : specifier.startsWith(`${packageName}/`)
          ? specifier.slice(packageName.length + 1)
          : null;

    if (
      entrypointName &&
      definition.entrypoints[entrypointName] &&
      (!publicOnly || definition.entrypoints[entrypointName].public !== false)
    ) {
      return { entrypointName, packageName };
    }
  }

  return null;
}

function formatContext(
  itemName: string,
  filePath: string,
  imported: ModuleImport
) {
  return `${itemName}:${filePath}:${imported.line}:${imported.column} -> ${imported.specifier}`;
}

function assertSourcePath(sourceRoot: string, filePath: string) {
  const absoluteRoot = resolve(sourceRoot);
  const sourcePath = resolve(absoluteRoot, filePath);
  const relativePath = relative(absoluteRoot, sourcePath);

  if (
    isAbsolute(relativePath) ||
    relativePath === '..' ||
    relativePath.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
  ) {
    throw new Error(`Registry source path escapes its root: ${filePath}`);
  }

  return sourcePath;
}

function addRequirement(
  requirements: Map<string, DependencyRequirement>,
  name: string,
  requirement: DependencyRequirement
) {
  const existing = requirements.get(name);

  if (!existing) {
    requirements.set(name, requirement);

    return;
  }
  if (!existing.range) {
    requirements.set(name, requirement.range ? requirement : existing);

    return;
  }
  if (!requirement.range) return;
  const intersection = intersectPackageVersionRanges(
    existing.range,
    requirement.range
  );

  if (!intersection) {
    throw new Error(
      `${requirement.context}: derived ${name}@${requirement.range} conflicts with ${name}@${existing.range} required by ${existing.context}.`
    );
  }
  requirements.set(name, {
    context: `${existing.context}; ${requirement.context}`,
    range: intersection,
  });
}

function reconcileDependencies(
  authoredDependencies: readonly string[],
  derivedRequirements: Map<string, DependencyRequirement>,
  itemName: string
) {
  const authoredByName = new Map<
    string,
    { dependency: string; range: string | null }
  >();

  for (const dependency of authoredDependencies) {
    const parsed = parsePackageDependency(dependency);
    const existing = authoredByName.get(parsed.name);

    if (existing) {
      throw new Error(
        `${itemName}: authored dependencies contain multiple requirements for ${parsed.name}: ${existing.dependency}, ${dependency}.`
      );
    }
    authoredByName.set(parsed.name, { dependency, range: parsed.range });
  }

  for (const [name, requirement] of derivedRequirements) {
    const authored = authoredByName.get(name);

    if (!authored?.range || !requirement.range) continue;
    if (!packageVersionRangesIntersect(authored.range, requirement.range)) {
      throw new Error(
        `${requirement.context}: authored ${authored.dependency} is incompatible with derived ${name}@${requirement.range}.`
      );
    }
  }

  const derived = [...derivedRequirements.entries()]
    .filter(([name]) => !authoredByName.has(name))
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
    .map(([name, requirement]) =>
      requirement.range ? `${name}@${requirement.range}` : name
    );

  return [...authoredDependencies, ...derived];
}

function getPlateDependencyNames(dependencies: readonly string[]) {
  return new Set(
    dependencies
      .filter((dependency) => dependency.startsWith('@plate/'))
      .map((dependency) => dependency.slice('@plate/'.length))
  );
}

function getShadcnDependencyNames(dependencies: readonly string[]) {
  return new Set(
    dependencies.map((dependency) =>
      dependency.startsWith('@shadcn/')
        ? dependency.slice('@shadcn/'.length)
        : dependency
    )
  );
}

export function deriveRegistryPackageDependencies(
  registry: Registry,
  options: DeriveRegistryPackageDependenciesOptions
): Registry {
  const dags =
    options.entrypointDags ?? (defaultEntrypointDags as EntrypointDags);
  const packageManifests =
    options.packageManifests ?? getDefaultPackageManifests();
  const hostProvidedAliases = new Set(
    options.hostProvidedAliases ?? DEFAULT_HOST_PROVIDED_ALIASES
  );
  const hostProvidedPackages = new Set(
    options.hostProvidedPackages ?? DEFAULT_HOST_PROVIDED_PACKAGES
  );
  const itemsByName = new Map(registry.items.map((item) => [item.name, item]));
  const targetResolver = createRegistryInstalledTargetResolver(registry);

  for (const item of registry.items) {
    for (const dependency of item.registryDependencies ?? []) {
      if (
        dependency.startsWith('@plate/') &&
        !itemsByName.has(dependency.slice('@plate/'.length))
      ) {
        throw new Error(
          `${item.name}: unknown Plate registry dependency ${dependency}.`
        );
      }
    }
  }

  return {
    ...registry,
    items: registry.items.map((item) => {
      if (item.meta?.registry === false) return { ...item };

      const requirements = new Map<string, DependencyRequirement>();
      const directPlateDependencies = getPlateDependencyNames(
        item.registryDependencies ?? []
      );
      const directShadcnDependencies = getShadcnDependencyNames(
        item.registryDependencies ?? []
      );

      const addEntrypointPeers = (
        initialSpecifier: string,
        context: string
      ) => {
        const initialTarget = getExactEntrypoint(initialSpecifier, dags, {
          publicOnly: true,
        });

        if (!initialTarget) {
          const packageName = getPackageName(initialSpecifier);
          const exportName = packageName
            ? initialSpecifier === packageName
              ? '.'
              : `.${initialSpecifier.slice(packageName.length)}`
            : null;

          if (
            packageName &&
            exportName &&
            Object.hasOwn(
              packageManifests[packageName]?.exports ?? {},
              exportName
            )
          ) {
            return;
          }

          throw new Error(
            `${context}: unknown public Plate/Plite entrypoint ${initialSpecifier}.`
          );
        }

        const visited = new Set<string>();
        const visit = (packageName: string, entrypointName: string) => {
          const identity = `${packageName}/${entrypointName}`;

          if (visited.has(identity)) return;
          visited.add(identity);

          const entrypoint = dags[packageName]?.entrypoints[entrypointName];

          if (!entrypoint) {
            throw new Error(
              `${context}: missing entrypoint DAG node ${identity}.`
            );
          }

          for (const peerDependency of entrypoint.peerDependencies ?? []) {
            if (hostProvidedPackages.has(peerDependency)) continue;

            const version =
              packageManifests[packageName]?.peerDependencies?.[peerDependency];

            if (!version) {
              throw new Error(
                `${context}: ${identity} requires ${peerDependency}, but ${packageName}/package.json has no peer dependency version.`
              );
            }
            addRequirement(requirements, peerDependency, {
              context: `${context} via ${identity}`,
              range: version,
            });
          }

          for (const dependency of entrypoint.dependencies ?? []) {
            visit(packageName, dependency);
          }
          for (const dependency of entrypoint.externalDependencies ?? []) {
            const target = getExactEntrypoint(dependency, dags, {
              publicOnly: false,
            });

            if (!target) {
              throw new Error(
                `${context}: ${identity} references missing external entrypoint ${dependency}.`
              );
            }
            visit(target.packageName, target.entrypointName);
          }
        };

        visit(initialTarget.packageName, initialTarget.entrypointName);
      };

      for (const file of item.files ?? []) {
        if (!isImportableRegistrySource(file.path)) continue;

        const sourcePath = assertSourcePath(options.sourceRoot, file.path);
        let source: string;

        try {
          source = readFileSync(sourcePath, 'utf-8');
        } catch (error) {
          throw new Error(
            `${item.name}:${file.path}: unable to read registry source: ${error instanceof Error ? error.message : String(error)}`,
            { cause: error }
          );
        }

        for (const imported of parseModuleImports(source, {
          filePath: file.path,
        })) {
          const context = formatContext(item.name, file.path, imported);
          const { specifier } = imported;

          if (specifier.startsWith('@/components/ui/')) {
            const dependencyName = specifier.slice('@/components/ui/'.length);

            if (!directShadcnDependencies.has(dependencyName)) {
              throw new Error(
                `${context}: missing direct shadcn registry dependency ${dependencyName}.`
              );
            }
            continue;
          }
          if (hostProvidedAliases.has(specifier)) continue;

          if (specifier.startsWith('.') || specifier.startsWith('@/')) {
            const owners = targetResolver.resolveCopiedOwners(file, specifier);

            if (!owners) {
              throw new Error(`${context}: no installed registry target.`);
            }

            const eligibleOwners = [...owners].filter(
              (owner) =>
                owner === item.name || directPlateDependencies.has(owner)
            );

            if (eligibleOwners.length === 0) {
              throw new Error(
                `${context}: missing direct registry dependency for ${[
                  ...owners,
                ]
                  .map((owner) => `@plate/${owner}`)
                  .join(' or ')}.`
              );
            }
            if (eligibleOwners.length > 1) {
              throw new Error(
                `${context}: installed registry target is ambiguous between ${eligibleOwners.join(', ')}.`
              );
            }
            continue;
          }

          const packageName = getPackageName(specifier);

          if (!packageName || hostProvidedPackages.has(packageName)) continue;

          addRequirement(requirements, packageName, {
            context,
            range: null,
          });

          if (packageName === 'platejs' || packageName === 'plitejs') {
            addEntrypointPeers(specifier, context);
          }
        }
      }

      const dependencies = reconcileDependencies(
        item.dependencies ?? [],
        requirements,
        item.name
      );

      return dependencies.length > 0 || item.dependencies
        ? { ...item, dependencies }
        : { ...item };
    }),
  };
}
