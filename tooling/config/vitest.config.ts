import { resolve } from 'node:path';
import { pathsToModuleNameMapper } from 'ts-jest';
// @ts-expect-error vitest to install
import { defineConfig } from 'vitest/config';

// Using dynamic import for CJS files
const tsConfig = await import('./tsconfig.test.json', {
  assert: { type: 'json' },
});
const aliases = await import('./aliases.cjs');

// Get the root directory path
const rootDir = resolve(__dirname);

// Convert tsconfig paths to Vitest format
const tsConfigPaths = tsConfig.default.compilerOptions.paths
  ? pathsToModuleNameMapper(tsConfig.default.compilerOptions.paths, {
      prefix: rootDir,
    })
  : {};

const modules: Record<string, string> = {};

// FIXME: Not working
Object.keys(aliases.default).forEach((key) => {
  const value = aliases.default[key as keyof typeof aliases.default];
  // Add explicit mappings for both base and /react subpath
  modules[key] = resolve(rootDir, `packages/${value}/src`);
  modules[`${key}/react`] = resolve(rootDir, `packages/${value}/src/react`);
});

export default defineConfig({
  test: {
    alias: {
      ...modules,
      ...tsConfigPaths,
      '\\.(css|less|sass|scss)$': resolve(
        rootDir,
        'tooling/config/styleMock.cjs'
      ),
    },
    coverage: {
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/test/**',
        '**/fixture/**',
        '**/template/**',
        '**/stories/**',
        '**/*.development.*',
        '**/packages/cli/**',
        '**/playwright/**',
      ],
      include: ['packages/**/src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    deps: {
      // Equivalent to Jest's transformIgnorePatterns
      // List of modules that should be transformed even though they are in node_modules
      inline: [
        'cheerio',
        'react-dnd',
        'dnd-core',
        '@react-dnd',
        'react-dnd-html5-backend',
        'react-tweet',
        'unified',
        /^remark-/,
        /^mdast-/,
        /^micromark/,
        /^unist-/,
        'markdown-table',
        'mdast-util-to-markdown',
        'zwitch',
        'longest-streak',
        'unist-util-visit',
        'mdast-util-phrasing',
        'escape-string-regexp',
        'micromark-util-decode-string',
        'decode-named-character-reference',
        'ccount',
        'bail',
        'devlop',
        'is-plain-obj',
        'trough',
        'vfile',
        'vfile-message',
        'is-reference',
        'is-buffer',
        '@types/unist',
        'unist-util-stringify-position',
        'mdast-util-from-markdown',
        'mdast-util-to-string',
      ],
      interopDefault: true,
    },
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/playwright/**',
      '**/packages/cli/**',
      '**/*.styles.ts*',
      '**/index.ts*',
      '**/*test*/**',
      '**/*fixture*/**',
      '**/*template*/**',
      '**/*stories*',
      '**/*.development.*',
    ],
    globals: true,
    include: ['**/*.{test,spec}.{ts,tsx}'],
    setupFiles: [resolve(rootDir, 'tooling/config/vitest.setup.ts')],
  },
});
