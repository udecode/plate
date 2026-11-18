import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { collectLucideUses, getIconProblems } from './lucide-icons.mts';
import { isImportableRegistrySource } from './registry-imports.mts';

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listSourceFiles(entryPath);

    return isImportableRegistrySource(entry.name) ? [entryPath] : [];
  });
}

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : listSourceFiles(path.join(import.meta.dirname, '../src/registry'));
const errors = files.flatMap((filePath) => {
  const relativePath = path.relative(process.cwd(), filePath);

  return getIconProblems(
    relativePath,
    collectLucideUses(readFileSync(filePath, 'utf-8'), relativePath)
  );
});

if (errors.length > 0) {
  console.error(
    `Registry icon check failed: the registry build swaps each Lucide icon for the project's icon library, so every icon must be a JSX element with a name in each library.\n${errors.join('\n')}`
  );
  process.exit(1);
}

console.info(`Registry icon check passed (${files.length} files).`);
