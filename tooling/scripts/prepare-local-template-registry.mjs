#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [sourceDir, targetDir] = process.argv.slice(2);

if (!sourceDir || !targetDir) {
  console.error(
    'Usage: node tooling/scripts/prepare-local-template-registry.mjs <sourceDir> <targetDir>'
  );
  process.exit(1);
}

const sourcePath = path.resolve(sourceDir);
const targetPath = path.resolve(targetDir);

await mkdir(targetPath, { recursive: true });

for (const entry of await readdir(sourcePath, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.json')) continue;

  const from = path.join(sourcePath, entry.name);
  const to = path.join(targetPath, entry.name);
  const content = await readFile(from, 'utf8');
  const parsed = JSON.parse(content);

  rewriteRegistryDependencies(parsed);

  await writeFile(to, `${JSON.stringify(parsed, null, 2)}\n`);
}

function rewriteRegistryDependencies(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      rewriteRegistryDependencies(item);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value.registryDependencies)) {
    value.registryDependencies = value.registryDependencies.map((dependency) =>
      toLocalDependency(dependency)
    );
  }

  for (const entry of Object.values(value)) {
    rewriteRegistryDependencies(entry);
  }
}

function toLocalDependency(dependency) {
  if (typeof dependency !== 'string') return dependency;

  try {
    const url = new URL(dependency);

    if (
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      url.pathname.endsWith('.json')
    ) {
      return path.basename(url.pathname);
    }

    return dependency;
  } catch {
    return dependency;
  }
}
