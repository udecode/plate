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

export function proseChunks(text) {
  const chunks = [];
  let fence = null;

  for (const line of text.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    const prose = !fence && !marker;

    if (!fence) fence = marker ?? null;
    else if (marker?.startsWith(fence[0]) && marker.length >= fence.length) {
      fence = null;
    }

    const last = chunks.at(-1);
    if (last?.prose === prose) last.text += `\n${line}`;
    else chunks.push({ prose, text: line });
  }

  return chunks;
}

function previewNames(text) {
  return proseChunks(text)
    .filter((chunk) => chunk.prose)
    .flatMap((chunk) => [
      ...chunk.text.matchAll(
        /<ComponentPreview\b[^>]*?\bname=["']([^"']+)["']/g
      ),
    ])
    .map((match) => match[1]);
}

export function listDocPages(root) {
  return execFileSync(
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
    )
    .map((file) => ({
      file,
      route: sourcePathToDocsRoute(file.slice('content/docs/'.length)),
    }));
}

export function readRegistryItems(root) {
  return JSON.parse(
    readFileSync(
      path.join(root, 'apps/www/src/__registry__/registry-metadata.json'),
      'utf-8'
    )
  ).registries.base.items;
}

export function readSources(root) {
  const items = readRegistryItems(root);
  const previews = new Map();
  const pages = [];

  for (const { file, route } of listDocPages(root)) {
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
