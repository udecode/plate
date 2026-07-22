#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertNoPrivatePlateDeclarationBrands } from './check-package-declaration-brands.mjs';

const runtimeExtensionPattern = /\.(?:c|m)?js$/;

export function getPackageBuildArtifacts(packageJson) {
  const artifacts = new Set();

  for (const value of Object.values(packageJson.exports ?? {})) {
    const runtimeTarget = readRuntimeTarget(value);
    const typesTarget = readTypesTarget(value) ?? toTypesTarget(runtimeTarget);

    for (const target of [runtimeTarget, typesTarget]) {
      if (!target) continue;
      if (target === './package.json') continue;
      if (!target.startsWith('./dist/')) {
        throw new Error(`Public build target must live in ./dist: ${target}`);
      }

      artifacts.add(target.slice(2));
    }
  }

  if (artifacts.size === 0) {
    throw new Error('Package has no public build artifacts.');
  }

  return [...artifacts];
}

export function assertPackageBuildArtifacts(packageRoot = process.cwd()) {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, 'package.json'), 'utf8')
  );
  const missing = getPackageBuildArtifacts(packageJson).filter(
    (artifact) => !existsSync(join(packageRoot, artifact))
  );

  if (missing.length > 0) {
    throw new Error(`Missing public build artifacts: ${missing.join(', ')}`);
  }

  assertNoPrivatePlateDeclarationBrands(packageRoot);
}

function readRuntimeTarget(value) {
  if (typeof value === 'string') {
    return runtimeExtensionPattern.test(value) ? value : null;
  }
  if (!value || typeof value !== 'object') return null;

  for (const key of ['import', 'default', 'node']) {
    const target = readRuntimeTarget(value[key]);

    if (target) return target;
  }

  for (const nestedValue of Object.values(value)) {
    const target = readRuntimeTarget(nestedValue);

    if (target) return target;
  }

  return null;
}

function readTypesTarget(value) {
  if (!value || typeof value !== 'object') return null;
  if (typeof value.types === 'string') return value.types;

  for (const nestedValue of Object.values(value)) {
    const target = readTypesTarget(nestedValue);

    if (target) return target;
  }

  return null;
}

const toTypesTarget = (runtimeTarget) =>
  runtimeTarget?.replace(runtimeExtensionPattern, '.d.ts') ?? null;

function isMainModule() {
  const entrypoint = process.argv[1];

  return !!entrypoint && resolve(entrypoint) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    assertPackageBuildArtifacts(resolve(process.argv[2] ?? '.'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
