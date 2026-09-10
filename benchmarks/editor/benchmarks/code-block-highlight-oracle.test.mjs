import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { chromium } from '@playwright/test';

import {
  hasExactCodeHighlight,
  hasInsertedCodeHighlight,
} from './code-block-highlight-oracle.mjs';

let browser;
before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

const probeSuffix = '\nconst __plateBenchmark = 1;';
const fixtureText = `const old = 0;${probeSuffix}`;

test('finds exact nested and split tokens at any text offset', async () => {
  const page = await browser.newPage();
  await page.addScriptTag({
    content: `globalThis.hasExactCodeHighlight = ${hasExactCodeHighlight.toString()}`,
  });
  const result = await page.evaluate(() => {
    const root = document.createElement('code');
    root.innerHTML =
      '<span class="hljs-number">1</span> a <span class="hljs-number"><i>2</i>3</span> z <span class="hljs-number">4<span></span></span>';
    root.lastChild.append(document.createTextNode(''));
    const check = (text, start, end) =>
      globalThis.hasExactCodeHighlight({
        root,
        className: 'hljs-number',
        text,
        start,
        end,
      });
    const valid = [check('1', 0, 1), check('23', 4, 6), check('4', 9, 10)];
    const invalid = [check('2', 4, 5), check('3', 5, 6), check('4', 8, 9)];
    root.innerHTML =
      '<span class="hljs-number">1<span class="hljs-number">2</span>3</span>';
    const nested = [check('123', 0, 3), check('2', 1, 2)];
    return { valid, invalid, nested };
  });
  assert.deepEqual(result, {
    valid: [true, true, true],
    invalid: [false, false, false],
    nested: [true, true],
  });
  await page.close();
});

test('rejects a highlight proof whose final token absorbs appended plain text', async () => {
  const page = await browser.newPage();
  await page.addScriptTag({
    content: `globalThis.hasExactCodeHighlight = ${hasExactCodeHighlight.toString()}`,
  });
  const result = await page.evaluate(() => {
    const root = document.createElement('code');
    const check = () =>
      globalThis.hasExactCodeHighlight({
        root,
        className: 'hljs-number',
        text: '1',
        start: 3,
        end: 4,
      });
    root.innerHTML = 'x; <span class="hljs-number">1 </span>';
    const expanded = check();
    root.innerHTML = 'x; <span class="hljs-number">1</span> ';
    const exact = check();
    root.innerHTML = 'x;<span class="hljs-number">1</span>  ';
    return { exact, expanded, shifted: check() };
  });
  assert.deepEqual(result, { exact: true, expanded: false, shifted: false });
  await page.close();
});

for (const strategy of ['codemirror', 'native']) {
  test(`${strategy}: an older highlighted keyword cannot certify inserted syntax`, async () => {
    const page = await browser.newPage();
    await page.addScriptTag({
      content: `globalThis.hasExactCodeHighlight = ${hasExactCodeHighlight.toString()}; globalThis.hasInsertedCodeHighlight = ${hasInsertedCodeHighlight.toString()}`,
    });
    const result = await page.evaluate(
      ({ mode, expectedSuffix, canonicalText }) => {
        const root = document.createElement('code');
        const old = '<span class="hljs-keyword">const</span> old = 0;';
        const inserted = expectedSuffix.slice(1);
        root.innerHTML =
          mode === 'codemirror'
            ? `<div class="cm-line">${old}</div><div class="cm-line">${inserted}</div>`
            : `${old}\n${inserted}`;
        const check = () =>
          globalThis.hasInsertedCodeHighlight({
            canonicalText,
            expectedSuffix,
            mode,
            root,
          });
        const absent = check();
        root.innerHTML = root.innerHTML.replace(
          inserted,
          '<span class="hljs-keyword">const</span> __plateBenchmark = 1;'
        );
        const highlighted = check();
        return {
          absent,
          highlighted,
          stale: globalThis.hasInsertedCodeHighlight({
            canonicalText: 'stale',
            expectedSuffix,
            mode,
            root,
          }),
        };
      },
      {
        mode: strategy,
        expectedSuffix: probeSuffix,
        canonicalText: fixtureText,
      }
    );
    assert.deepEqual(result, {
      absent: false,
      highlighted: true,
      stale: false,
    });
    await page.close();
  });
}
