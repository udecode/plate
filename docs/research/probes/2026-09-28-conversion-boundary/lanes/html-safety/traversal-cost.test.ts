import { expect, test } from 'bun:test';
import { writeFileSync } from 'node:fs';

import { BaseLinkPlugin } from '../../../../../../packages/platejs/src/features/link/lib/BaseLinkPlugin';
import { BaseListPlugin } from '../../../../../../packages/platejs/src/features/list/lib/BaseListPlugin';
import { BaseImagePlugin } from '../../../../../../packages/platejs/src/features/media/lib/image/BaseImagePlugin';
import { createEditor } from '../../../../../../packages/platejs/src/lib/editor';
import { parseHtmlAst } from '../../../../../../packages/platejs/src/lib/plugins/html/htmlAst';
import { sanitizeHtmlDom } from '../../../../../../packages/platejs/src/lib/plugins/html/htmlSafety';

// Rich pasted HTML: paragraphs with links, images, styles and list items.
const source = (blocks: number) =>
  Array.from(
    { length: blocks },
    (_, index) =>
      `<p style="color: red">Paragraph ${index} <a href="https://example.com/${index}">link</a> <img alt="a" src="https://example.com/${index}.png"></p><ul><li>Item <a href="java&#9;script:alert(${index})">x</a></li></ul>`
  ).join('');
const median = (values: number[]) =>
  [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
const time = (run: () => void, repeat = 5) =>
  median(
    Array.from({ length: repeat }, () => {
      const startedAt = performance.now();

      run();

      return performance.now() - startedAt;
    })
  );

test('HTML safety traversal cost against a whole parse', () => {
  const editor = createEditor({
    plugins: [BaseImagePlugin, BaseLinkPlugin, BaseListPlugin],
  });
  const rows = [250, 1000, 2000].map((blocks) => {
    const html = source(blocks);
    const parse = time(() => {
      editor.api.html.parseSlice(html, { lossPolicy: 'allow' });
    }, 1);
    const astWithSourcePass = time(() => {
      parseHtmlAst(html, 'slice');
    });
    const domPass = time(() => {
      const { body } = new DOMParser().parseFromString(html, 'text/html');

      sanitizeHtmlDom(body, () => {});
    });
    const domParseOnly = time(() => {
      new DOMParser().parseFromString(html, 'text/html');
    });

    return {
      blocks,
      bytes: html.length,
      domPassMs: Math.max(0, domPass - domParseOnly),
      parseAstWithSourcePassMs: astWithSourcePass,
      wholeParseSliceMs: parse,
    };
  });

  writeFileSync(
    `${import.meta.dir}/traversal-cost.json`,
    `${JSON.stringify(rows, null, 2)}\n`
  );
  console.log(rows);
  expect(rows).toHaveLength(3);
}, 300_000);
