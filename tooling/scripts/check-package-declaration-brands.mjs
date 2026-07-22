#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const declarationFilePattern = /\.d\.(?:c|m)?ts$/;
const privateBrandPatterns = [
  /\b(?:declare\s+)?const\s+(PLATE_[A-Z0-9_]+)\s*:\s*unique\s+symbol\b/g,
  /\btypeof\s+(PLATE_[A-Z0-9_]+)\b/g,
  /\[\s*(PLATE_[A-Z0-9_]+)\s*\]/g,
  /\b(?:import|export)\s+(?:type\s+)?\{[\s\S]*?\b(PLATE_[A-Z0-9_]*(?:BRAND|MARKER|MODEL|TOKEN|WITNESS)[A-Z0-9_]*)\b[\s\S]*?\}\s+from\b/g,
];

export function auditPrivatePlateDeclarationBrands(files) {
  const errors = [];

  for (const file of files) {
    if (!declarationFilePattern.test(file.path)) continue;

    const brands = new Set();

    for (const pattern of privateBrandPatterns) {
      pattern.lastIndex = 0;

      for (const match of file.source.matchAll(pattern)) {
        brands.add(match[1]);
      }
    }

    for (const brand of brands) {
      errors.push(
        `${file.path}: public declaration exposes private Plate brand ${brand}`
      );
    }
  }

  return errors;
}

export function assertNoPrivatePlateDeclarationBrands(
  packageRoot = process.cwd()
) {
  const distRoot = join(packageRoot, 'dist');

  if (!existsSync(distRoot)) return;

  const files = walkDeclarationFiles(distRoot).map((path) => ({
    path: toPosixPath(relative(packageRoot, path)),
    source: readFileSync(path, 'utf8'),
  }));
  const errors = auditPrivatePlateDeclarationBrands(files);

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

function walkDeclarationFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkDeclarationFiles(path));
      continue;
    }
    if (entry.isFile() && declarationFilePattern.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

const toPosixPath = (path) => path.split(sep).join('/');

function isMainModule() {
  const entrypoint = process.argv[1];

  return !!entrypoint && resolve(entrypoint) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    assertNoPrivatePlateDeclarationBrands(resolve(process.argv[2] ?? '.'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
