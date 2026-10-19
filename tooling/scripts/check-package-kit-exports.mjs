#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

const ignoredDirectories = new Set([
  '.tmp',
  '.turbo',
  '__tests__',
  'coverage',
  'dist',
  'node_modules',
  'type-tests',
]);
const sourceFilePattern = /\.(?:c|m)?tsx?$/;
const testFilePattern = /\.(?:spec|test)\.|\.d\.(?:c|m)?ts$/;

const toPosixPath = (path) => path.split(sep).join('/');

const collectPackageSources = (directory, files) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const path = join(directory, entry.name);

    if (entry.isDirectory()) collectPackageSources(path, files);
    else if (
      sourceFilePattern.test(entry.name) &&
      !testFilePattern.test(entry.name)
    ) {
      files.push(path);
    }
  }
};

const exportedKitNames = (source) => {
  const ast = parse(source, {
    plugins: ['typescript', 'jsx'],
    sourceType: 'module',
  });
  const names = [];

  for (const node of ast.program.body) {
    if (node.type !== 'ExportNamedDeclaration' || node.exportKind === 'type') {
      continue;
    }
    if (node.declaration?.type === 'VariableDeclaration') {
      for (const declarator of node.declaration.declarations) {
        if (declarator.id.name?.endsWith('Kit')) {
          names.push(declarator.id.name);
        }
      }
    }
    for (const specifier of node.specifiers) {
      const name = specifier.exported.name ?? specifier.exported.value;

      if (specifier.exportKind !== 'type' && name.endsWith('Kit')) {
        names.push(name);
      }
    }
  }

  return names;
};

export const findPackageKitExports = (repoRoot) => {
  const findings = [];
  const packagesDirectory = join(repoRoot, 'packages');

  for (const entry of readdirSync(packagesDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const files = [];
    const sourceDirectory = join(packagesDirectory, entry.name, 'src');

    if (!existsSync(sourceDirectory)) continue;
    collectPackageSources(sourceDirectory, files);
    for (const file of files) {
      for (const name of exportedKitNames(readFileSync(file, 'utf-8'))) {
        findings.push(`${toPosixPath(relative(repoRoot, file))}: ${name}`);
      }
    }
  }

  return findings.sort();
};

const main = () => {
  const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
  const findings = findPackageKitExports(repoRoot);

  if (findings.length > 0) {
    throw new Error(
      `Package source exports a named plugin-array kit:\n${findings
        .map((finding) => `- ${finding}`)
        .join(
          '\n'
        )}\nExport individual plugins; app or registry source owns *Kit arrays.`
    );
  }
  console.info('Package kit export audit passed.');
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
