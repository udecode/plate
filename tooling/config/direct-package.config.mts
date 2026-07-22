import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';

import { assertPackageBuildArtifacts } from '../scripts/check-package-build-artifacts.mjs';

const typescript7Warning = 'TypeScript 7.0 does not yet have a stable API';

export const withDirectPackageConfig = (config: UserConfig): UserConfig => {
  if (typeof config.hooks === 'function') {
    throw new Error('Direct package config requires object hooks.');
  }

  const packageRoot = process.cwd();
  const onBuildDone = config.hooks?.['build:done'];
  const suppressWarnings = config.suppressWarnings;

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
        assertPackageBuildArtifacts(packageRoot);
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

export const defineDirectPackageConfig = (config: UserConfig) =>
  defineConfig(withDirectPackageConfig(config));
