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
import { EditorStatic } from 'platejs/static';

const editor = createEditor({
  plugins: [Paragraph.configure({ component: ParagraphElementStatic })],
  initialValue: [{ type: 'paragraph', children: [{ text: 'Static snippet proof' }] }],
});

assert.match(renderToStaticMarkup(<EditorStatic editor={editor} />), /Static snippet proof/);
`
    );
  });
}

for (const [suffix, heading, body] of [
  ['mdx', 'Title', 'Body'],
  ['cn.mdx', '标题', '正文'],
]) {
  test(`Node.js ${suffix} Markdown example round-trips a heading and bold text`, () => {
    runExample(
      `content/docs/installation/node.${suffix}`,
      'parseMarkdown(',
      `
import assert from 'node:assert/strict';

assert.equal(parsed.ok, true);
assert.equal(output.ok, true);
assert.equal(output.data.trim(), '# ${heading}\\n\\n**${body}**');
`
    );
  });
}
