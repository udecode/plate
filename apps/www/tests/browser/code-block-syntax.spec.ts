import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';
import type { Value } from 'platejs';

type BrowserHandleElement = HTMLElement & {
  __pliteBrowserHandle: {
    getValue: () => { children: Value };
    applyValueChange: (
      value: { children: Value },
      policy?: { tags: string[] }
    ) => void;
  };
};

const ROUTE =
  process.env.CODE_BLOCK_SYNTAX_ROUTE ?? '/blocks/code-block-codemirror-demo';

test.setTimeout(120_000);

for (const lines of [20, 2000, 10_000, 100_000]) {
  test(`code-block: exact syntax and continuous input at ${lines} lines`, async ({
    page,
  }, info) => {
    expect(info.retry).toBe(0);
    const errors = recordPliteBrowserRuntimeErrors(page);
    try {
      await page.goto(ROUTE, { waitUntil: 'commit' });
      const root = page.locator('.plite-editor').first();
      const editor = createPliteBrowserEditorHarness(
        page,
        'code-block:syntax-corpus',
        root
      );
      await editor.ready({ editor: 'visible', text: 'Huge Code Block' });
      const text = Array.from(
        { length: lines },
        (_, index) => `const result${index} = transform(source[${index}]);`
      ).join('\n');
      await root.evaluate((element, code) => {
        const handle = (element as BrowserHandleElement).__pliteBrowserHandle;
        const value = handle.getValue();
        handle.applyValueChange({
          ...value,
          children: value.children.map((block, index) =>
            index === 2 ? { ...block, children: [{ text: code }] } : block
          ),
        });
      }, text);
      await editor.selection.collapse({ path: [2, 0], offset: text.length });
      await editor.focus();
      const host = page.locator('[data-code-block-codemirror]');
      const input = host.locator('[data-code-block-codemirror-input]');
      await expect(input).toBeFocused();
      const suffix = '\nconst __continuous = 123456789;';
      const started = Date.now();
      await page.keyboard.type(suffix, { delay: 12 });
      await expect.poll(() => editor.get.modelBlockText(2)).toBe(text + suffix);
      await expect(host.locator('.cm-line').last()).toHaveText(suffix.slice(1));
      await expect(
        host.locator('.cm-line').last().locator('.hljs-keyword')
      ).toHaveText('const');
      const renderedLines = await host.locator('.cm-line').count();
      expect(renderedLines).toBeLessThan(100);
      await info.attach('syntax-corpus', {
        contentType: 'application/json',
        body: JSON.stringify({
          lines,
          bytes: Buffer.byteLength(text),
          renderedLines,
          continuousInputAndSyntaxMs: Date.now() - started,
        }),
      });
      const selection = await editor.get.selection();
      expect(selection?.focus).toEqual({
        path: [2, 0],
        offset: text.length + suffix.length,
      });
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
