#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (isMainModule()) {
  const configPath = process.argv[2];

  if (!configPath) {
    throw new Error(
      'Usage: node tooling/scripts/normalize-template-tsconfig.mjs <tsconfig.json>'
    );
  }

  await normalizeTemplateTsconfigFile(configPath);
}

export function normalizeTemplateTsconfig(config) {
  const normalized = structuredClone(config);
  const compilerOptions = normalized.compilerOptions;

  if (!compilerOptions || typeof compilerOptions !== 'object') {
    return normalized;
  }

  const hadRelativeBaseUrl = compilerOptions.baseUrl === '.';

  normalized.compilerOptions = Object.fromEntries(
    Object.entries(compilerOptions).filter(
      ([key, value]) =>
        !(key === 'baseUrl' && value === '.') &&
        !(key === 'ignoreDeprecations' && value === '6.0')
    )
  );

  if (hadRelativeBaseUrl) {
    for (const targets of Object.values(
      normalized.compilerOptions.paths ?? {}
    )) {
      if (!Array.isArray(targets)) continue;

      for (let index = 0; index < targets.length; index++) {
        const target = targets[index];

        if (
          typeof target === 'string' &&
          !target.startsWith('.') &&
          !target.startsWith('/')
        ) {
          targets[index] = `./${target}`;
        }
      }
    }
  }

  return normalized;
}

async function normalizeTemplateTsconfigFile(configPath) {
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const normalized = normalizeTemplateTsconfig(config);

  await writeFile(configPath, `${JSON.stringify(normalized, null, 2)}\n`);
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}
