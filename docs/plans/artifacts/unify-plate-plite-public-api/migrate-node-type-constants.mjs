import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const root = process.cwd();
const constantsSource = readFileSync(
  `${root}/packages/utils/src/lib/plate-keys.ts`,
  'utf8'
);
const nodesBody = constantsSource.match(
  /export const NODES = \{([\s\S]*?)\n\} as const;/
)?.[1];

if (!nodesBody) throw new Error('Unable to read NODES keys.');

const nodeNames = new Set(
  [...nodesBody.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)].map((match) => match[1])
);
const files = execFileSync(
  'rg',
  ['--files', 'packages', 'apps/www/src', 'content', '-g', '*.{ts,tsx,md,mdx}'],
  { cwd: root, encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .filter(Boolean);

const replaceNodeName = (source, pattern, prefix) =>
  source.replace(pattern, (match, before, name) =>
    nodeNames.has(name) ? `${before}${prefix}.${name}` : match
  );

const updateUtilsImport = (source) => {
  if (!/\bNODES\./.test(source)) return source;

  return source.replace(
    /import\s*\{([\s\S]*?)\}\s*from '@platejs\/utils';/,
    (statement, imports) => {
      if (/\bNODES\b/.test(imports)) return statement;

      const stillUsesKeys = /\bKEYS\./.test(source.replace(statement, ''));
      const nextImports = stillUsesKeys
        ? imports.replace(/\bKEYS\b/, 'KEYS, NODES')
        : imports.replace(/\bKEYS\b/, 'NODES');

      return statement.replace(imports, nextImports);
    }
  );
};

let _changed = 0;

for (const file of files) {
  const path = `${root}/${file}`;
  const source = readFileSync(path, 'utf8');
  let next = source;

  next = replaceNodeName(
    next,
    /(\btype\s*:\s*)KEYS\.([A-Za-z0-9_]+)/g,
    'NODES'
  );
  next = replaceNodeName(
    next,
    /(\btype\s*:\s*typeof\s*)KEYS\.([A-Za-z0-9_]+)/g,
    'NODES'
  );
  next = replaceNodeName(
    next,
    /(\btype\s*(?:===|!==|==|!=)\s*)KEYS\.([A-Za-z0-9_]+)/g,
    'NODES'
  );
  next = replaceNodeName(
    next,
    /(\.installed\s*\?[^:\n]+\.type\s*:\s*)KEYS\.([A-Za-z0-9_]+)/g,
    'NODES'
  );
  next = updateUtilsImport(next);

  if (next !== source) {
    writeFileSync(path, next);
    _changed++;
  }
}
