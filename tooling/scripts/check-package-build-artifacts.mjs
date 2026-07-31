#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertNoPrivatePlateDeclarationBrands } from './check-package-declaration-brands.mjs';

const runtimeExtensionPattern = /\.(?:c|m)?js$/;
const anyPluginDeclarationPattern =
  /\bdeclare\s+const\s+[A-Za-z_$][\w$]*Plugin\s*:\s*any\s*;/gu;

export function getPackageBuildArtifacts(packageJson) {
  const artifacts = new Set();

  for (const value of Object.values(packageJson.exports ?? {})) {
    const runtimeTargets = readRuntimeTargets(value);
    const explicitTypesTargets = readTypesTargets(value);
    const typesTargets =
      explicitTypesTargets.length > 0
        ? explicitTypesTargets
        : runtimeTargets.map(toTypesTarget);

    for (const target of [...runtimeTargets, ...typesTargets]) {
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
  const artifacts = getPackageBuildArtifacts(packageJson);
  const missing = artifacts.filter(
    (artifact) => !existsSync(join(packageRoot, artifact))
  );

  if (missing.length > 0) {
    throw new Error(`Missing public build artifacts: ${missing.join(', ')}`);
  }

  const erasedPlugins = artifacts
    .filter((artifact) => artifact.endsWith('.d.ts'))
    .flatMap((artifact) => {
      const source = readFileSync(join(packageRoot, artifact), 'utf8');

      return [...source.matchAll(anyPluginDeclarationPattern)].map(
        (match) => `${artifact}: ${match[0]}`
      );
    });

  if (erasedPlugins.length > 0) {
    throw new Error(
      `Public plugin declarations collapsed to any:\n${erasedPlugins
        .map((entry) => `- ${entry}`)
        .join('\n')}`
    );
  }

  assertNoPrivatePlateDeclarationBrands(packageRoot);
}

function readRuntimeTargets(value) {
  if (typeof value === 'string') {
    return runtimeExtensionPattern.test(value) ? [value] : [];
  }
  if (!value || typeof value !== 'object') return [];

  return Object.values(value).flatMap(readRuntimeTargets);
}

function readTypesTargets(value) {
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    key === 'types' && typeof nestedValue === 'string'
      ? [nestedValue]
      : readTypesTargets(nestedValue)
  );
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
