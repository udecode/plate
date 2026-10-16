import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const warningListeners = process.listeners('warning');
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.code === 'MODULE_TYPELESS_PACKAGE_JSON') return;
  for (const listener of warningListeners) listener(warning);
});
const { sourcePathToDocsRoute } =
  await import('../../apps/www/src/lib/docs-routes.ts');

export const PLITE_EXAMPLES_DIR = 'apps/www/src/app/(app)/examples/plite';

function previewNames(text) {
  const prose = [];
  let fence = null;

  for (const line of text.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker && !fence) fence = marker;
    else if (
      marker &&
      marker.startsWith(fence[0]) &&
      marker.length >= fence.length
    ) {
      fence = null;
    } else if (!fence) prose.push(line);
  }

  return [
    ...prose
      .join('\n')
      .matchAll(/<ComponentPreview\b[^>]*?\bname=["']([^"']+)["']/g),
  ].map((match) => match[1]);
}

export function readSources(root) {
  const { items } = JSON.parse(
    readFileSync(
      path.join(root, 'apps/www/src/__registry__/registry-metadata.json'),
      'utf-8'
    )
  ).registries.base;
  const previews = new Map();
  const docs = execFileSync(
    'git',
    [
      'ls-files',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      'content/docs',
    ],
    {
      cwd: root,
      encoding: 'utf-8',
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'ignore'],
    }
  )
    .split('\n')
    .filter(
      (file) => file.endsWith('.mdx') && existsSync(path.join(root, file))
    );
  const pages = [];

  for (const file of docs) {
    const route = sourcePathToDocsRoute(file.slice('content/docs/'.length));
    pages.push(route);
    for (const name of previewNames(
      readFileSync(path.join(root, file), 'utf-8')
    )) {
      previews.set(name, [...new Set([...(previews.get(name) ?? []), route])]);
    }
  }

  const loadersFile = path.join(
    root,
    PLITE_EXAMPLES_DIR,
    'plite-example-loaders.tsx'
  );
  const loaders = existsSync(loadersFile)
    ? [
        ...readFileSync(loadersFile, 'utf-8').matchAll(
          /['"]?([\w-]+)['"]?:\s*createPliteExampleLoader\(\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]/g
        ),
      ].map(([, id, specifier]) => ({
        base: specifier.startsWith('@/')
          ? `apps/www/src/${specifier.slice(2)}`
          : path.posix.join(PLITE_EXAMPLES_DIR, specifier),
        route: `/examples/plite/${id}`,
      }))
    : [];

  return { items, loaders, pages, previews };
}
