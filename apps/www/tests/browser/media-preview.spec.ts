import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Page } from '@playwright/test';

const CAPTION = 'Images with captions provide context.';

const openCaptionedImage = async (page: Page, caseId: string) => {
  await page.goto('/blocks/playground', { waitUntil: 'commit' });
  const root = page
    .locator('[data-editor="true"][contenteditable="true"]')
    .first();
  const editor = createBrowserEditorHarness(page, caseId, root);
  await editor.ready({ editor: 'visible', text: CAPTION });

  const value = (await editor.get.modelValue()) as {
    children: Array<{ children?: Array<{ text?: string }>; type?: string }>;
  };
  const imageIndex = value.children.findIndex(
    (node) => node.type === 'image' && node.children?.[0]?.text === CAPTION
  );
  const image = root
    .locator('figure')
    .filter({ hasText: CAPTION })
    .locator('img');
  const modelSelection = () =>
    root.evaluate((element) =>
      (
        element as HTMLElement & {
          __EDITOR_BROWSER_HANDLE__?: { getModelSelection: () => unknown };
        }
      ).__EDITOR_BROWSER_HANDLE__?.getModelSelection()
    );

  expect(imageIndex).toBeGreaterThanOrEqual(0);
  await image.scrollIntoViewIfNeeded();

  return {
    closePreview: page.getByRole('button', { name: 'Close preview' }).first(),
    editor,
    image,
    imageIndex,
    modelSelection,
  };
};

test('double-clicking an image opens its preview and Escape returns to the image', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { closePreview, editor, image, imageIndex, modelSelection } =
      await openCaptionedImage(page, 'media-preview:double-click');

    await image.dblclick();
    await expect(closePreview).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Previous image' }).locator('..')
    ).not.toHaveText('0');

    await page.keyboard.press('Escape');
    await expect(closePreview).toBeHidden();
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      paths: [[imageIndex]],
    });
    expect(await editor.get.domSelection()).toBeNull();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('the toolbar Preview button opens the image preview', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { closePreview, image } = await openCaptionedImage(
      page,
      'media-preview:toolbar'
    );

    await image.click();
    await page.getByRole('button', { exact: true, name: 'Preview' }).click();
    await expect(closePreview).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('the preview centers the image and Escape closes it after the toolbar opened it', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { closePreview, image } = await openCaptionedImage(
      page,
      'media-preview:toolbar-escape'
    );

    await image.click();
    await page.getByRole('button', { exact: true, name: 'Preview' }).click();
    await expect(closePreview).toBeVisible();

    const previewImage = page.getByRole('button', {
      name: 'Zoom in preview image',
    });

    await expect
      .poll(async () => {
        const box = await previewImage.boundingBox();
        const viewport = page.viewportSize();

        return box && viewport
          ? Math.round(Math.abs(box.x + box.width / 2 - viewport.width / 2))
          : null;
      })
      .toBeLessThanOrEqual(1);

    await previewImage.click();
    await page.keyboard.press('Escape');
    await expect(closePreview).toBeHidden();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('a click on the preview backdrop closes it', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { closePreview, image } = await openCaptionedImage(
      page,
      'media-preview:backdrop'
    );

    await image.dblclick();
    await expect(closePreview).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(closePreview).toBeHidden();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('the preview covers the home page edge to edge above a site header', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const root = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const editor = createBrowserEditorHarness(page, 'media-preview:home', root);
    await editor.ready({ editor: 'visible', text: CAPTION });

    await page.evaluate(() => {
      const header = document.createElement('header');
      header.style.cssText =
        'position: fixed; inset: 0 0 auto; height: 64px; z-index: 50; background: white';
      document.body.append(header);
    });

    const image = root
      .locator('figure')
      .filter({ hasText: CAPTION })
      .locator('img');

    await image.scrollIntoViewIfNeeded();
    await image.dblclick();
    await expect(
      page.getByRole('button', { name: 'Close preview' }).first()
    ).toBeVisible();

    // The page's overlay scrollbar paints above every layer and hit-tests as
    // <html>, so the right probe stays clear of it.
    const topLabels = await page.evaluate(() =>
      [
        [8, 8],
        [8, window.innerHeight - 8],
        [document.documentElement.clientWidth - 24, window.innerHeight / 2],
      ].map(([x, y]) =>
        document.elementFromPoint(x, y)?.getAttribute('aria-label')
      )
    );

    expect(topLabels).toEqual([
      'Close preview',
      'Close preview',
      'Close preview',
    ]);
    await expect(
      page.getByRole('button', { name: 'Previous image' }).locator('..')
    ).not.toHaveText('0');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
