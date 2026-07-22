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

  return {
    clean: true,
    format: ['esm'],
    outExtensions: () => ({ js: '.js' }),
    platform: 'neutral',
    sourcemap: !process.env.CI,
    tsconfig: 'tsconfig.build.json',
    ...config,
    deps: { ...config.deps, neverBundle: true },
    dts: { sourcemap: false },
    exports: false,
    failOnWarn: 'ci-only',
    hooks: {
      ...config.hooks,
      'build:done': async (context) => {
        await onBuildDone?.(context);
        assertPackageBuildArtifacts(packageRoot);
      },
    },
    suppressWarnings: [typescript7Warning],
  };
};

export const defineDirectPackageConfig = (config: UserConfig) =>
  defineConfig(withDirectPackageConfig(config));
