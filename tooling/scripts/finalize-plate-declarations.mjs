#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const declarationFilePattern = /\.d\.(?:c|m)?ts$/;
const generatedRegionLinePattern = /^\s*\/\/#(?:end)?region\b.*(?:\r?\n|$)/gmu;
const privatePackageNamePattern = /plite/iu;

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
    const output = source.replace(generatedRegionLinePattern, '');

    if (output !== source) writeFileSync(filename, output);

    const match = privatePackageNamePattern.exec(output);

    if (!match) continue;

    const line = output.slice(0, match.index).split(/\r?\n/u).length;
    privateReferences.push(`${path.relative(root, filename)}:${line}`);
  }

  if (privateReferences.length > 0) {
    throw new Error(
      `Plate declarations expose the private Plite layer:\n${privateReferences.join(
        '\n'
      )}`
    );
  }
};

const entrypoint = process.argv[1];

if (entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)) {
  finalizePlateDeclarations(process.argv[2] ?? 'dist');
}
