#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const declarationFilePattern = /\.d\.(?:c|m)?ts$/;
const regionLinePattern = /^\s*\/\/#(end)?region\b ?(.*?)\s*$/u;
export const privatePackageNamePattern = /plite/iu;

// A bundled plitejs file keeps its own region, relative to plitejs, inside the
// one platejs opens, and only the inner region is closed, so every earlier
// region is a candidate until its source holds the line.
const sourceLine = (packageDirectory, region, text) => {
  const segments = path
    .resolve(packageDirectory, region)
    .replace(declarationFilePattern, '')
    .split(path.sep);
  const dist = segments.indexOf('dist');

  if (dist !== -1) segments[dist] = 'src';

  const base = segments.join(path.sep);
  const filename = ['.ts', '.tsx']
    .map((extension) => base + extension)
    .find(existsSync);

  if (!filename) return null;

  const line = readFileSync(filename, 'utf-8')
    .split(/\r?\n/u)
    .findIndex((sourceText) => sourceText.trim() === text.trim());

  return line === -1
    ? null
    : `${path.relative(process.cwd(), filename)}:${line + 1}`;
};

const walkDeclarations = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);

    if (entry.isDirectory()) return walkDeclarations(filename);
    return entry.isFile() && declarationFilePattern.test(entry.name)
      ? [filename]
      : [];
  });

export const finalizePlateDeclarations = (declarationRoot) => {
  const root = path.resolve(declarationRoot);

  if (!existsSync(root)) {
    throw new Error(`Plate declaration root does not exist: ${root}`);
  }

  const privateReferences = [];

  for (const filename of walkDeclarations(root)) {
    const source = readFileSync(filename, 'utf-8');
    const kept = [];
    const regions = [];

    for (const text of source.split(/(?<=\n)/u)) {
      const marker = regionLinePattern.exec(text);

      if (marker) {
        if (!marker[1]) regions.push(marker[2]);
        continue;
      }

      kept.push(text);

      if (!privatePackageNamePattern.test(text)) continue;

      const bundled = `${path.relative(root, filename)}:${kept.length}`;
      const origin = regions
        .toReversed()
        .map((region) => sourceLine(path.dirname(root), region, text))
        .find(Boolean);
      privateReferences.push(origin ? `${origin} (${bundled})` : bundled);
    }

    const output = kept.join('');

    if (output !== source) writeFileSync(filename, output);
  }

  if (privateReferences.length > 0) {
    throw new Error(
      `Plate declarations expose the private Plite layer. Reword each line to describe the behavior without naming Plite; a plitejs JSDoc on a declaration platejs bundles lands here too:\n${privateReferences.join(
        '\n'
      )}`
    );
  }
};

const entrypoint = process.argv[1];

if (entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)) {
  finalizePlateDeclarations(process.argv[2] ?? 'dist');
}
