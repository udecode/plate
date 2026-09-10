import fs from 'node:fs';
import path from 'node:path';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';

export const workspaceSourcePathConfigFiles = Object.freeze([
  'tsconfig.json',
  'apps/www/tsconfig.json',
  'packages/cli/tsconfig.json',
  'packages/platejs/tsconfig.json',
  'packages/plitejs/tsconfig.json',
  'packages/test/tsconfig.json',
  'tooling/config/tsconfig.test.json',
  'tooling/config/tsconfig.type-tests.json',
]);

const normalizePath = (value) => value.replaceAll(path.sep, '/');

const relativeSourcePath = (configPath, sourceEntry) => {
  const relative = normalizePath(
    path.relative(path.dirname(configPath), sourceEntry)
  );

  return relative.startsWith('.') ? relative : `./${relative}`;
};

const editorSourcePaths = (repoRoot, configPath) =>
  Object.fromEntries(
    getWorkspaceSourceEntries(repoRoot)
      .filter(({ specifier }) => /^(?:platejs|plitejs)(?:\/|$)/.test(specifier))
      .sort((left, right) => left.specifier.localeCompare(right.specifier))
      .map(({ sourceEntry, specifier }) => [
        specifier,
        [relativeSourcePath(configPath, sourceEntry)],
      ])
  );

const expectedConfig = (repoRoot, relativeConfigPath) => {
  const configPath = path.join(repoRoot, relativeConfigPath);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const currentPaths = config.compilerOptions?.paths;

  if (!currentPaths || typeof currentPaths !== 'object') {
    throw new Error(
      `${relativeConfigPath} must declare compilerOptions.paths.`
    );
  }

  const generated = editorSourcePaths(repoRoot, configPath);
  const paths = {};
  let inserted = false;

  for (const [specifier, targets] of Object.entries(currentPaths)) {
    if (specifier === 'platejs/math/katex.css') {
      paths[specifier] = targets;
      continue;
    }
    if (/^(?:platejs|plitejs)(?:\/|$)/.test(specifier)) {
      if (!inserted) {
        Object.assign(paths, generated);
        inserted = true;
      }
      continue;
    }
    paths[specifier] = targets;
  }
  if (!inserted) Object.assign(paths, generated);

  return {
    ...config,
    compilerOptions: { ...config.compilerOptions, paths },
  };
};

export const assertWorkspaceSourcePathsGenerated = (repoRoot) => {
  for (const relativeConfigPath of workspaceSourcePathConfigFiles) {
    const actual = JSON.parse(
      fs.readFileSync(path.join(repoRoot, relativeConfigPath), 'utf-8')
    );
    const expected = expectedConfig(repoRoot, relativeConfigPath);

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `${relativeConfigPath} has stale editor source paths. Run pnpm entrypoint:turbo:generate.`
      );
    }
  }
};

export const writeWorkspaceSourcePathsGenerated = (repoRoot) => {
  for (const relativeConfigPath of workspaceSourcePathConfigFiles) {
    const configPath = path.join(repoRoot, relativeConfigPath);
    const expected = expectedConfig(repoRoot, relativeConfigPath);

    fs.writeFileSync(configPath, `${JSON.stringify(expected, null, 2)}\n`);
  }
};
