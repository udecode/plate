#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

const ignoredDirectories = new Set([
  '.git',
  '.tmp',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
]);

const toPosixPath = (path) => path.split(sep).join('/');

const isSourceDeclaration = (repoRoot, file) => {
  const path = toPosixPath(relative(repoRoot, file));

  return (
    path.endsWith('.d.ts') &&
    (path.includes('/src/') || path.includes('/type-tests/'))
  );
};

const collectSourceDeclarations = (repoRoot, directory, declarations) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      collectSourceDeclarations(repoRoot, path, declarations);
    } else if (entry.isFile() && isSourceDeclaration(repoRoot, path)) {
      declarations.push(toPosixPath(relative(repoRoot, path)));
    }
  }
};

export const findSourceDeclarationLeaks = (repoRoot) => {
  const declarations = [];
  const packagesDirectory = join(repoRoot, 'packages');

  collectSourceDeclarations(repoRoot, packagesDirectory, declarations);

  return declarations
    .filter((path) => {
      if (path.includes('/type-tests/')) return true;

      const source = join(repoRoot, path.slice(0, -'.d.ts'.length));

      return existsSync(`${source}.ts`) || existsSync(`${source}.tsx`);
    })
    .sort(compareStrings);
};

export const assertNoSourceDeclarationLeaks = (repoRoot) => {
  const leaks = findSourceDeclarationLeaks(repoRoot);

  if (leaks.length > 0) {
    throw new Error(
      `Generated declarations escaped into package sources:\n${leaks
        .map((path) => `- ${path}`)
        .join('\n')}\nEmit declaration probes into .tmp instead.`
    );
  }
};

export const resolveSourceDeclarationRepoRoot = () =>
  resolve(fileURLToPath(new URL('../..', import.meta.url)));

const main = () => {
  const repoRoot = resolveSourceDeclarationRepoRoot();

  if (!isAbsolute(repoRoot)) {
    throw new Error('Declaration leak audit requires an absolute repository.');
  }

  assertNoSourceDeclarationLeaks(repoRoot);
  console.info('Source declaration leak audit passed.');
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
