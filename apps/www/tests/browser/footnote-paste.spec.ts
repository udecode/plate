import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

// `gh api markdown --mode gfm` of "First claim[^1] and second claim[^1].
// [^1]: Shared note.", as a GitHub comment renders it.
const githubComment = `<p>First claim<sup><a href="#user-content-fn-1-ddf7cf2ca0ae4081b35487a2cf359cda" id="user-content-fnref-1-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup> and second claim<sup><a href="#user-content-fn-1-ddf7cf2ca0ae4081b35487a2cf359cda" id="user-content-fnref-1-2-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>
<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>
<ol>
<li id="user-content-fn-1-ddf7cf2ca0ae4081b35487a2cf359cda">
<p>Shared note. <a href="#user-content-fnref-1-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a> <a href="#user-content-fnref-1-2-ddf7cf2ca0ae4081b35487a2cf359cda" data-footnote-backref="" aria-label="Back to reference 1-2" class="data-footnote-backref">↩<sup>2</sup></a></p>
</li>
</ol>
</section>`;

type ModelNode = {
  children?: ModelNode[];
  ref?: string;
  text?: string;
  type?: string;
};

const nodesOfType = (nodes: readonly ModelNode[], type: string): ModelNode[] =>
  nodes.flatMap((node) => [
    ...(node.type === type ? [node] : []),
    ...nodesOfType(node.children ?? [], type),
  ]);

const textOf = (node: ModelNode): string =>
  node.text ?? (node.children ?? []).map(textOf).join('');

test('a GitHub comment copied in the browser pastes as footnotes with GitHub numbers', async ({
  browserName,
  page,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'Native clipboard permissions');
  const errors = recordBrowserRuntimeErrors(page, { strict: true });

  try {
    await page.route('https://github.com/o/r', (route) =>
      route.fulfill({
        body: `<!doctype html><html><body><div class="markdown-body">${githubComment}</div></body></html>`,
        contentType: 'text/html',
      })
    );
    await page.goto('https://github.com/o/r');
    await page.locator('.markdown-body').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    });
    await page.keyboard.press('ControlOrMeta+C');
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const [item] = await navigator.clipboard.read();

          if (!item?.types.includes('text/html')) return '';

          const html = await item.getType('text/html');

          return html.text();
        })
      )
      .toContain('href="https://github.com/o/r#user-content-fn-1-');

    await page.goto('/blocks/playground-demo', { waitUntil: 'commit' });
    const root = page.locator('[data-editor="true"]').first();
    const editor = createBrowserEditorHarness(page, testInfo.title, root);
    await editor.ready({
      editor: 'visible',
      text: 'Welcome to the Plate Playground!',
    });
    await root
      .getByRole('heading', {
        exact: true,
        name: 'Welcome to the Plate Playground!',
      })
      .click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ControlOrMeta+V');

    await expect(
      root.getByRole('button', { exact: true, name: '[1]' })
    ).toHaveCount(2);
    const value = (
      (await editor.get.modelValue()) as { children: ModelNode[] }
    ).children;
    expect(
      nodesOfType(value, 'footnoteReference').map((node) => node.ref)
    ).toEqual(['1', '1']);
    expect(
      value
        .filter((node) => node.type === 'footnoteDefinition')
        .map((node) => ({ ref: node.ref, text: textOf(node) }))
    ).toEqual([{ ref: '1', text: 'Shared note. ' }]);
    expect(textOf(value[1])).toBe('First claim and second claim.');
    await expect(root).not.toContainText('Footnotes');
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
