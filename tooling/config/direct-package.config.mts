import path from 'node:path';

import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

import {
  assertPackageBuildArtifacts,
  assertPackageRuntimeImportBoundaries,
} from '../scripts/check-package-build-artifacts.mjs';

const typescript7Warning = 'TypeScript 7.0 does not yet have a stable API';

export type RuntimeImportBoundary = Readonly<{
  entry: string;
  forbiddenPackages: readonly string[];
}>;

type RuntimeImportBoundaryOptions = Readonly<{
  runtimeImportBoundaries?: readonly RuntimeImportBoundary[];
}>;

export const withRuntimeImportBoundaryConfig = (
  config: UserConfig,
  { runtimeImportBoundaries = [] }: RuntimeImportBoundaryOptions = {}
): UserConfig => {
  if (typeof config.hooks === 'function') {
    throw new Error('Runtime import boundary config requires object hooks.');
  }

  const packageRoot = path.resolve(config.cwd ?? process.cwd());
  const onBuildDone = config.hooks?.['build:done'];

  return {
    ...config,
    hooks: {
      ...config.hooks,
      'build:done': async (context) => {
        await onBuildDone?.(context);
        assertPackageRuntimeImportBoundaries(packageRoot, {
          runtimeImportBoundaries,
        });
      },
    },
  };
};

export const withDirectPackageConfig = (
  config: UserConfig,
  { runtimeImportBoundaries = [] }: RuntimeImportBoundaryOptions = {}
): UserConfig => {
  if (typeof config.hooks === 'function') {
    throw new Error('Direct package config requires object hooks.');
  }

  const packageRoot = path.resolve(config.cwd ?? process.cwd());
  const onBuildDone = config.hooks?.['build:done'];
  const { suppressWarnings } = config;

  return {
    clean: true,
    format: ['esm'],
    outExtensions: () => ({ js: '.js' }),
    platform: 'neutral',
    sourcemap: !process.env.CI,
    tsconfig: 'tsconfig.build.json',
    ...config,
    deps: { ...config.deps, neverBundle: true },
    dts: {
      ...(typeof config.dts === 'object' ? config.dts : {}),
      sourcemap: false,
    },
    exports: false,
    failOnWarn: 'ci-only',
    hooks: {
      ...config.hooks,
      'build:done': async (context) => {
        await onBuildDone?.(context);
        assertPackageBuildArtifacts(packageRoot, { runtimeImportBoundaries });
      },
    },
    suppressWarnings:
      typeof suppressWarnings === 'function'
        ? (message) =>
            message.includes(typescript7Warning) || suppressWarnings(message)
        : [
            typescript7Warning,
            ...(Array.isArray(suppressWarnings)
              ? suppressWarnings
              : suppressWarnings
                ? [suppressWarnings]
                : []),
          ],
  };
};

export const defineDirectPackageConfig = (
  config: UserConfig,
  options: RuntimeImportBoundaryOptions = {}
) => defineConfig(withDirectPackageConfig(config, options));
