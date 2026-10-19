import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('full editor keeps its toolbar outside the scrollport after resizing', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto(
      process.env.PLATE_INSTALLED_EDITOR_PROOF === '1'
        ? '/editor'
        : '/blocks/editor-ai'
    );
    const editor = page.locator(
      '[data-editor="true"][contenteditable="true"]:not([aria-label])'
    );
    const heading = editor.getByRole('heading', {
      name: 'Welcome to the Plate Playground!',
      exact: true,
    });
    await expect(heading).toBeVisible();

    const frameLayout = () =>
      editor.evaluate((element) => {
        const frame = element.closest<HTMLElement>(
          '[data-slot="editor-frame"]'
        );
        const scrollport = element.closest<HTMLElement>(
          '[data-slot="editor-container"]'
        );
        const toolbar = frame?.querySelector<HTMLElement>(
          '[data-slot="fixed-toolbar"]'
        );
        if (!frame || !scrollport || !toolbar) {
          throw new Error('Full editor frame is incomplete');
        }
        const outer = frame.getBoundingClientRect();
        const scroll = scrollport.getBoundingClientRect();
        const toolbarBounds = toolbar.getBoundingClientRect();
        const inner = element.getBoundingClientRect();
        const scrollContentLeft = scroll.left + scrollport.clientLeft;
        const scrollContentRight = scrollContentLeft + scrollport.clientWidth;
        const title = element.querySelector('h1');
        if (!title) throw new Error('Full editor heading is missing');
        const range = document.createRange();
        range.selectNodeContents(title);

        return {
          bounded: scroll.bottom <= outer.bottom + 1,
          directScrollport: scrollport.parentElement === frame,
          directToolbar: toolbar.parentElement === frame,
          editorFits:
            Math.abs(inner.width - scrollport.clientWidth) <= 1 &&
            inner.left >= scrollContentLeft - 1 &&
            inner.right <= scrollContentRight + 1,
          separate: toolbarBounds.bottom <= scroll.top + 1,
          titleFits: [...range.getClientRects()].every(
            (rect) => rect.left >= scroll.left && rect.right <= scroll.right
          ),
        };
      });

    const expectedLayout = {
      bounded: true,
      directScrollport: true,
      directToolbar: true,
      editorFits: true,
      separate: true,
      titleFits: true,
    };

    for (let run = 0; run < 5; run++) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await expect.poll(frameLayout).toEqual(expectedLayout);
      await page.setViewportSize({ width: 433, height: 900 });
      await expect.poll(frameLayout).toEqual(expectedLayout);
    }

    await page.screenshot({
      path: testInfo.outputPath('editor-ai-narrow.png'),
    });
    await expect.poll(frameLayout).toEqual(expectedLayout);
    await heading.click();
    await page.keyboard.type(' layout-proof');
    await expect(editor).toContainText(' layout-proof');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
