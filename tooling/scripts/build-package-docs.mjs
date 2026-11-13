import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  listDocPages,
  proseChunks,
  readRegistryItems,
} from './docs-sources.mjs';

export const DOCS_DIR = 'dist/docs';

export const docsIndexHeading = ({ name, version }) =>
  `# Plate docs for ${name}@${version}`;

export function renderDocsIndex(packageJson, pages) {
  return `${docsIndexHeading(packageJson)}

These pages match the installed \`${packageJson.name}\` version. A \`/docs/<path>\` link in a page is the file \`<path>.md\` in this folder when the list below names it, and \`/docs\` is \`index.md\`. Read the pages your task needs before you write editor code.

${pages
  .map(
    ({ description, out, title }) =>
      `- [${title}](${out})${description ? `: ${description}` : ''}`
  )
  .join('\n')}
`;
}

const ROOT = path.resolve(import.meta.dirname, '../..');
const PACKAGE_DIR = path.join(ROOT, 'packages/platejs');
const REGISTRY_TAG =
  /<Component(PreviewPro|Preview|Source|Installation)\b([^>]*?)\/>/g;

const attribute = (attributes, name) =>
  new RegExp(`\\b${name}="([^"]+)"`).exec(attributes)?.[1];

function registryTagAsText(registryFiles, file, kind, attributes) {
  const name = attribute(attributes, 'name');
  const sourceNote = (label, files) =>
    `_${label} in the Plate repository: ${files
      .map((source) => `\`apps/www/src/registry/${source}\``)
      .join(', ')}._`;

  if (kind === 'PreviewPro') {
    return `_Plate Pro example \`${name}\`, which is not in the free registry._`;
  }
  if (!name) {
    const src = attribute(attributes, 'src');
    if (!src) throw new Error(`${file}: <Component${kind}> has no name or src`);
    return sourceNote('Source', [src]);
  }
  if (existsSync(path.join(ROOT, 'apps/www/public/r', `${name}.json`))) {
    return `_Registry item \`${name}\`: \`npx shadcn@latest add @plate/${name}\`._`;
  }

  const files = registryFiles.get(name);
  if (!files) throw new Error(`${file}: unknown registry item ${name}`);
  return sourceNote(`Example \`${name}\``, files);
}

function toMarkdown(registryFiles, file) {
  const text = readFileSync(path.join(ROOT, file), 'utf-8');
  const [, head, body] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text) ?? [];
  if (head === undefined) throw new Error(`${file} has no frontmatter`);

  const field = (key) => {
    const value = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(head)?.[1].trim();
    return value?.startsWith('"') ? JSON.parse(value) : value;
  };
  const title = field('title');
  if (!title) throw new Error(`${file} has no title`);
  const description = field('description');
  const content = proseChunks(body)
    .map(({ prose, text: chunk }) =>
      prose
        ? chunk.replace(REGISTRY_TAG, (_tag, kind, attributes) =>
            registryTagAsText(registryFiles, file, kind, attributes)
          )
        : chunk
    )
    .join('\n')
    .trim();

  return {
    description,
    markdown: [`# ${title}`, description, content]
      .filter(Boolean)
      .join('\n\n')
      .concat('\n'),
    title,
  };
}

function writePackageDocs() {
  const packageJson = JSON.parse(
    readFileSync(path.join(PACKAGE_DIR, 'package.json'), 'utf-8')
  );
  const outDir = path.join(PACKAGE_DIR, DOCS_DIR);
  const registryFiles = new Map(
    readRegistryItems(ROOT).map((item) => [
      item.name,
      item.files.map((file) => file.path),
    ])
  );
  const pages = listDocPages(ROOT)
    .filter(({ file }) => !file.endsWith('.cn.mdx'))
    .map(({ file, route }) => ({
      out:
        route === '/docs' ? 'index.md' : `${route.slice('/docs/'.length)}.md`,
      ...toMarkdown(registryFiles, file),
    }))
    .sort((a, b) => (a.out < b.out ? -1 : 1));

  rmSync(outDir, { force: true, recursive: true });

  for (const { markdown, out } of pages) {
    mkdirSync(path.dirname(path.join(outDir, out)), { recursive: true });
    writeFileSync(path.join(outDir, out), markdown);
  }

  writeFileSync(
    path.join(outDir, 'llms.txt'),
    renderDocsIndex(packageJson, pages)
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  writePackageDocs();
}
