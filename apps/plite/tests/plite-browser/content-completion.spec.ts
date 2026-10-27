import {
  createBrowserEditorHarness,
  expect,
  openExample,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Page } from '@playwright/test';

type Json = { readonly [key: string]: unknown; readonly children?: Json[] };

const open = async (page: Page) => {
  await openExample(page, 'plite/content-completion', {
    ready: { editor: 'visible', text: 'Title' },
    surface: { scope: '#content-completion-surface' },
  });

  const root = page.locator('#content-completion');
  const harness = createBrowserEditorHarness(page, 'content-completion', root);
  const children = async () => {
    const value = (await harness.get.modelValue()) as { children: Json[] };

    return value.children;
  };
  const childAt = async (index: number) => {
    const all = await children();

    return all[index];
  };
  const block = (index: number) =>
    root.locator(
      `:scope > [data-editor-node="element"][data-editor-path="${index}"]`
    );
  const caretAtEnd = async (index: number, text: string) => {
    await block(index).getByText(text, { exact: true }).click();
    await page.keyboard.press('End');
  };

  return { block, caretAtEnd, childAt, children };
};

const paragraph = (...children: Json[]) => ({ children, type: 'paragraph' });

test.describe('content completion in Chromium', () => {
  test('types into a text element after a command removes its only text node', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { block, childAt } = await open(page);

    await page
      .getByRole('button', { name: 'Remove the text node of line 2' })
      .click();
    await expect.poll(() => childAt(1)).toEqual(paragraph({ text: '' }));

    await block(1).click();
    await page.keyboard.type('x');

    await expect.poll(() => childAt(1)).toEqual(paragraph({ text: 'x' }));
    await expect(block(1)).toHaveText('x');
    errors.assertNone();
  });

  test('keeps the block when typing into the text after it in mixed content', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { block, childAt } = await open(page);

    await block(2).getByText('Tail').click();
    await page.keyboard.press('End');
    await page.keyboard.type('X');

    await expect
      .poll(() => childAt(2))
      .toEqual({
        children: [
          { text: 'Lead' },
          paragraph({ text: 'Block' }),
          { text: 'TailX' },
        ],
        type: 'block-quote',
      });
    errors.assertNone();
  });

  test('restores the start on undo of a heading inserted above the required title', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { block, childAt, children } = await open(page);
    const start = await children();

    await block(0).click();
    await page
      .getByRole('button', { name: 'Insert a heading above the title' })
      .click();
    await expect
      .poll(() => Promise.all([childAt(0), childAt(1)]))
      .toEqual([
        { children: [{ text: 'New' }], type: 'title' },
        { children: [{ text: 'Title' }], type: 'title' },
      ]);

    await page.keyboard.press('ControlOrMeta+z');

    await expect.poll(children).toEqual(start);
    errors.assertNone();
  });

  test('types bold after deleting every character of a bold line', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { block, caretAtEnd, childAt } = await open(page);

    await caretAtEnd(3, 'bold');
    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('Backspace');
    }
    await expect.poll(() => childAt(3)).toEqual(paragraph({ text: '' }));

    await page.keyboard.type('x');

    await expect
      .poll(() => childAt(3))
      .toEqual(paragraph({ bold: true, text: 'x' }));
    await expect(block(3).locator('strong')).toHaveText('x');
    errors.assertNone();
  });

  test('types bold on the new line after Enter at the end of a bold line', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { block, caretAtEnd, childAt } = await open(page);

    await caretAtEnd(3, 'bold');
    await page.keyboard.press('Enter');
    await expect.poll(() => childAt(4)).toEqual(paragraph({ text: '' }));

    await page.keyboard.type('z');

    await expect
      .poll(() => childAt(4))
      .toEqual(paragraph({ bold: true, text: 'z' }));
    await expect(block(4).locator('strong')).toHaveText('z');
    errors.assertNone();
  });

  test('types plain text once the caret leaves the emptied bold line and comes back', async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });
    const { block, caretAtEnd, childAt } = await open(page);

    await caretAtEnd(4, 'bold');
    for (let index = 0; index < 4; index += 1) {
      await page.keyboard.press('Backspace');
    }
    await expect.poll(() => childAt(4)).toEqual(paragraph({ text: '' }));

    await block(5).getByText('Other line').click();
    await block(4).click();
    await page.keyboard.type('y');

    await expect.poll(() => childAt(4)).toEqual(paragraph({ text: 'y' }));
    await expect(block(4).locator('strong')).toHaveCount(0);
    errors.assertNone();
  });
});
