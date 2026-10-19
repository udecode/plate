import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { expect, test } from '@playwright/test';

const testRequire = createRequire(`${process.cwd()}/package.json`);
const bundles = ['react-dom', 'react-dom-experimental'].flatMap((channel) =>
  [
    'react-dom-client.development',
    'react-dom-client.production',
    'react-dom-profiling.development',
    'react-dom-profiling.profiling',
    ...(channel === 'react-dom-experimental'
      ? [
          'react-dom-unstable_testing.development',
          'react-dom-unstable_testing.production',
        ]
      : []),
  ].map((bundle) => `${channel}/cjs/${bundle}.js`)
);

for (const bundle of bundles) {
  test(`React selection capture preserves native offsets: ${bundle}`, async ({
    page,
  }) => {
    const source = readFileSync(
      testRequire.resolve(`next/dist/compiled/${bundle}`),
      'utf-8'
    );
    const start = source.indexOf('var length = 0,');
    const end = source.indexOf('} else JSCompiler_temp = null;', start);
    expect(start).toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const capture = `(root, JSCompiler_temp, anchorOffset, focusNode, selection) => {
      ${source.slice(start, end)}
      return JSCompiler_temp;
    }`;
    await page.setContent(
      '<div id="root" contenteditable="true"><span id="a">A😀</span><span contenteditable="false">UI</span><b id="b">xy</b><span id="empty"></span></div><p id="outside">other</p>'
    );
    const results = await page.evaluate((captureSource) => {
      const read = new Function(`return (${captureSource})`)();
      const root = document.querySelector('#root')!;
      const a = document.querySelector('#a')!.firstChild!;
      const b = document.querySelector('#b')!.firstChild!;
      const empty = document.querySelector('#empty')!;
      const outside = document.querySelector('#outside')!.firstChild!;
      return [
        read(root, a, 0, a, 0),
        read(root, a, 1, b, 2),
        read(root, b, 2, a, 1),
        read(root, root, 1, root, 2),
        read(root, empty, 0, empty, 0),
        read(root, b.parentNode, 0, b.parentNode, 1),
        read(root, outside, 0, a, 1),
      ];
    }, capture);
    expect(results).toEqual([
      { start: 0, end: 0 },
      { start: 1, end: 7 },
      { start: 7, end: 1 },
      { start: 3, end: 5 },
      { start: 7, end: 7 },
      { start: 5, end: 7 },
      null,
    ]);
  });
}
