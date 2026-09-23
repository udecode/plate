import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('Delete clears a fully selected caption without deleting its image', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.route('https://images.unsplash.com/**', (route) =>
      route.fulfill({
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"/>',
        contentType: 'image/svg+xml',
      })
    );
    await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
    const root = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editor = createBrowserEditorHarness(
      page,
      'media-caption:delete-selected-text',
      root
    );

    await editor.ready({
      editor: 'visible',
      text: 'Images with captions provide context.',
    });

    const initial = (await editor.get.modelValue()) as {
      children: Array<{
        children?: Array<{ text?: string }>;
        type?: string;
        url?: string;
      }>;
    };
    const imageIndex = initial.children.findIndex(
      (node) =>
        node.type === 'image' &&
        node.children?.[0]?.text === 'Images with captions provide context.'
    );

    expect(imageIndex).toBeGreaterThanOrEqual(0);
    const imageUrl = initial.children[imageIndex].url;
    const caption = root.locator('figcaption').first();

    await expect(caption).toHaveText('Images with captions provide context.');
    await caption.scrollIntoViewIfNeeded();
    await caption.click();
    await caption.selectText();
    await expect
      .poll(() => page.evaluate(() => getSelection()?.toString()))
      .toBe('Images with captions provide context.');
    await expect
      .poll(() =>
        root.evaluate((element) =>
          (
            element as HTMLElement & {
              __pliteBrowserHandle?: { getModelSelection: () => unknown };
            }
          ).__pliteBrowserHandle?.getModelSelection()
        )
      )
      .toMatchObject({
        anchor: { path: [imageIndex, 0], offset: 0 },
        focus: { path: [imageIndex, 0], offset: 37 },
        kind: 'text',
      });
    await page.keyboard.press('Delete');

    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;

        return value.children[imageIndex];
      })
      .toMatchObject({
        children: [{ text: '' }],
        type: 'image',
        url: imageUrl,
      });
    await expect
      .poll(() =>
        root.evaluate((element) =>
          (
            element as HTMLElement & {
              __pliteBrowserHandle?: { getModelSelection: () => unknown };
            }
          ).__pliteBrowserHandle?.getModelSelection()
        )
      )
      .toMatchObject({
        anchor: { path: [imageIndex, 0], offset: 0 },
        focus: { path: [imageIndex, 0], offset: 0 },
        kind: 'text',
      });
    await expect(caption).toBeVisible();
    await expect(caption).toHaveAttribute(
      'data-placeholder',
      'Write a caption...'
    );
    await expect(root).toBeFocused();
    await expect
      .poll(() =>
        caption.evaluate((element) =>
          element.contains(getSelection()?.anchorNode ?? null)
        )
      )
      .toBe(true);
    const caretToPlaceholderStart = await caption.evaluate((element) => {
      const range = getSelection()?.getRangeAt(0);
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const context = document.createElement('canvas').getContext('2d')!;

      context.font = style.font;

      return Math.abs(
        (range?.getBoundingClientRect().x ?? 0) -
          (bounds.x +
            bounds.width / 2 -
            context.measureText(element.dataset.placeholder ?? '').width / 2)
      );
    });

    expect(caretToPlaceholderStart).toBeLessThan(3);

    await page.keyboard.press('ControlOrMeta+z');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;

        return value.children[imageIndex]?.children?.[0]?.text;
      })
      .toBe('Images with captions provide context.');
    await caption.click();
    await caption.selectText();
    await page.keyboard.type('Revised caption');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;

        return value.children[imageIndex];
      })
      .toMatchObject({
        children: [{ text: 'Revised caption' }],
        type: 'image',
        url: imageUrl,
      });

    await caption.click();
    await caption.selectText();
    await page.keyboard.press('Delete');
    await expect(caption).toHaveAttribute(
      'data-placeholder',
      'Write a caption...'
    );
    await root.getByRole('heading', { name: 'Images and Media' }).click();
    await expect(caption).toBeHidden();
    await caption.locator('..').locator('img').click();
    await expect(caption).toBeVisible();
    await caption.click();
    await page.keyboard.type('Typed after refocus');
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as typeof initial;

        return value.children[imageIndex];
      })
      .toMatchObject({
        children: [{ text: 'Typed after refocus' }],
        type: 'image',
        url: imageUrl,
      });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('an initially empty centered caption keeps its caret beside the placeholder', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/media-demo', { waitUntil: 'commit' });
    const root = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editor = createBrowserEditorHarness(
      page,
      'media-caption:initially-empty',
      root
    );

    await editor.ready({ editor: 'visible', text: 'Image caption' });

    const figure = root.locator('figure:has(video)').first();
    const caption = figure.locator('figcaption');

    await expect(caption).toBeHidden();
    await figure.click({ position: { x: 2, y: 2 } });
    await expect(caption).toBeVisible();
    await caption.click();

    const layout = await caption.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const context = document.createElement('canvas').getContext('2d')!;

      context.font = style.font;

      return {
        caretX: element.firstElementChild?.getBoundingClientRect().x,
        height: bounds.height,
        lineHeight: Number.parseFloat(style.lineHeight),
        placeholderStartX:
          bounds.x +
          bounds.width / 2 -
          context.measureText(element.dataset.placeholder ?? '').width / 2,
        selectionInside: element.contains(getSelection()?.anchorNode ?? null),
      };
    });

    expect(layout.selectionInside).toBe(true);
    expect(layout.height).toBeLessThanOrEqual(layout.lineHeight + 1);
    expect(layout.caretX).toBeDefined();
    expect(Math.abs(layout.caretX! - layout.placeholderStartX)).toBeLessThan(3);

    await page.keyboard.type('Video caption');
    await expect(caption).toHaveText('Video caption');
    await expect(caption).not.toHaveAttribute('data-placeholder');
    await caption.click();
    await caption.selectText();
    await expect
      .poll(() => page.evaluate(() => getSelection()?.toString()))
      .toBe('Video caption');
    await expect
      .poll(() =>
        root.evaluate((element) =>
          (
            element as HTMLElement & {
              __pliteBrowserHandle?: { getModelSelection: () => unknown };
            }
          ).__pliteBrowserHandle?.getModelSelection()
        )
      )
      .toMatchObject({
        anchor: { offset: 0 },
        focus: { offset: 13 },
        kind: 'text',
      });
    await page.keyboard.press('Delete');
    await expect(caption).toHaveAttribute(
      'data-placeholder',
      'Write a caption...'
    );
    await expect
      .poll(() =>
        caption.evaluate((element) => element.getBoundingClientRect().height)
      )
      .toBeLessThanOrEqual(layout.lineHeight + 1);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
