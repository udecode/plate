import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { extractJavaScriptCodeFences } from './check-plate-doc-code-contracts.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../..');

const runExample = (file, title, assertions) => {
  const source = readFileSync(path.join(repoRoot, file), 'utf-8');
  const fence = extractJavaScriptCodeFences(source).find(({ code }) =>
    code.includes(title)
  );

  assert.ok(fence, `Missing ${title} example in ${file}`);
  const cache = path.join(repoRoot, 'node_modules/.cache');

  mkdirSync(cache, { recursive: true });
  const directory = mkdtempSync(path.join(cache, 'plate-doc-example-'));
  const executable = path.join(directory, 'example.tsx');

  try {
    writeFileSync(executable, `${fence.code}\n${assertions}\n`);
    const result = spawnSync(
      'bun',
      ['--preload', './config/plite-source-aliases.ts', executable],
      { cwd: repoRoot, encoding: 'utf-8', timeout: 30_000 }
    );

    assert.ifError(result.error);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
};

for (const suffix of ['mdx', 'cn.mdx']) {
  test(`static ${suffix} component example renders its supplied content`, () => {
    runExample(
      `content/docs/(guides)/static.${suffix}`,
      'export function ParagraphElementStatic(',
      `
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { BaseParagraphPlugin as Paragraph, createEditor } from 'platejs';
import { PlateStatic } from 'platejs/static';

const editor = createEditor({
  plugins: [Paragraph.configure({ component: ParagraphElementStatic })],
  initialValue: [{ type: 'paragraph', children: [{ text: 'Static snippet proof' }] }],
});

assert.match(renderToStaticMarkup(<PlateStatic editor={editor} />), /Static snippet proof/);
`
    );
  });
}

test('Chinese Node.js example reads text, changes the heading, and appends a paragraph', () => {
  runExample(
    'content/docs/installation/node.cn.mdx',
    'async function processDocument(',
    `
import assert from 'node:assert/strict';

const result = await processDocument([
  { type: 'heading', level: 1, children: [{ text: 'Title' }] },
  { type: 'paragraph', children: [{ text: 'Body' }] },
]);

assert.equal(result.transformedValue[0].level, 2);
assert.equal(result.transformedValue.length, 3);
assert.equal(result.transformedValue[2].children[0].text, '由Node.js脚本添加！');
assert.equal(result.textContent, 'TitleBody');
`
  );
});

test('English Node.js example updates headings and serializes the complete result', () => {
  runExample(
    'content/docs/installation/node.mdx',
    'export function normalizeHeadings(',
    `
import assert from 'node:assert/strict';

const result = normalizeHeadings([
  { type: 'heading', level: 1, children: [{ text: 'Title' }] },
  { type: 'paragraph', children: [{ text: 'Body' }] },
]);

assert.equal(result.value[0].level, 2);
assert.equal(result.value.length, 3);
assert.match(result.markdown, /^## Title/);
assert.match(result.text, /Imported from the legacy CMS/);
`
  );
});
