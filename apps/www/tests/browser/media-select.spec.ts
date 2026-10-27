import {
  createBrowserEditorHarness,
  expect,
  recordBrowserRuntimeErrors,
  test,
} from '@platejs/test/playwright';
import type { Page } from '@playwright/test';

const EDITOR = '[data-editor="true"][contenteditable="true"]';

const openMediaDemo = async (page: Page, caseId: string, type: string) => {
  await page.goto('/blocks/media-demo', { waitUntil: 'commit' });
  const root = page.locator(EDITOR).first();
  const editor = createBrowserEditorHarness(page, caseId, root);

  await editor.ready({ editor: 'visible', text: 'Image caption' });

  const value = (await editor.get.modelValue()) as {
    children: Array<{ type?: string; url?: string }>;
  };
  const index = value.children.findIndex((node) => node.type === type);
  const captionText = async () => {
    const updated = (await editor.get.modelValue()) as {
      children: Array<{ children?: Array<{ text?: string }> }>;
    };

    return updated.children[index].children?.[0]?.text;
  };
  const modelSelection = () =>
    root.evaluate((element) =>
      (
        element as HTMLElement & {
          __EDITOR_BROWSER_HANDLE__?: { getModelSelection: () => unknown };
        }
      ).__EDITOR_BROWSER_HANDLE__?.getModelSelection()
    );

  expect(index).toBeGreaterThan(0);

  return {
    captionText,
    editor,
    index,
    modelSelection,
    root,
    url: value.children[index].url ?? '',
  };
};

test('a click selects a file, and Preview or a double-click opens it', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const { index, modelSelection, root, url } = await openMediaDemo(
      page,
      'media-select:file-click',
      'file'
    );
    const link = root.locator('figure a[download]');

    await page
      .context()
      .route(url, (route) =>
        route.fulfill({ body: 'file', contentType: 'text/plain' })
      );
    await link.click();
    await expect.poll(modelSelection).toMatchObject({
      kind: 'node',
      mode: 'object',
      paths: [[index]],
    });

    const previewing = page.context().waitForEvent('page');

    await page.getByRole('button', { exact: true, name: 'Preview' }).click();

    const previewed = await previewing;

    await previewed.waitForURL(url);
    await expect(root).toBeFocused();

    const opening = page.context().waitForEvent('page');

    await link.dblclick();

    const opened = await opening;

    await opened.waitForURL(url);
    expect(page.context().pages()).toHaveLength(3);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

for (const [type, figure] of [
  ['file', 'figure:has(a[download])'],
  ['audio', 'figure:has(audio)'],
  ['video', 'figure:has(video)'],
]) {
  test(`the toolbar Caption button opens an empty ${type} caption`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { captionText, editor, index, modelSelection, root } =
        await openMediaDemo(page, `media-select:${type}-caption-button`, type);
      const below = { offset: 0, path: [index + 1, 0] };
      const caption = root.locator(figure).first().locator('figcaption');

      await root.locator(figure).first().scrollIntoViewIfNeeded();
      await editor.selection.selectDOM({ anchor: below, focus: below });
      await page.keyboard.press('ArrowUp');
      await expect.poll(modelSelection).toMatchObject({
        kind: 'node',
        mode: 'object',
        paths: [[index]],
      });
      await expect(caption).toBeHidden();
      await page.getByRole('button', { exact: true, name: 'Caption' }).click();
      await expect(caption).toBeVisible();
      await page.keyboard.type('Clip notes');
      await expect.poll(captionText).toBe('Clip notes');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

for (const type of ['audio', 'video']) {
  test(`a click on the ${type} player selects it and keeps arrow keys in the editor`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { index, modelSelection, root } = await openMediaDemo(
        page,
        `media-select:${type}-player-click`,
        type
      );
      const player = root.locator(type).first();

      await player.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          player.evaluate((media: HTMLMediaElement) => media.readyState)
        )
        .toBeGreaterThan(0);

      const box = await player.boundingBox();

      if (!box) throw new Error(`${type} player has no box`);

      await player.click({ position: { x: 20, y: box.height - 18 } });
      await expect.poll(modelSelection).toMatchObject({
        kind: 'node',
        mode: 'object',
        paths: [[index]],
      });
      await expect(root).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect.poll(modelSelection).not.toMatchObject({
        paths: [[index]],
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}

for (const [type, figure] of [
  ['file', 'figure:has(a[download])'],
  ['audio', 'figure:has(audio)'],
]) {
  test(`a click in the ${type} block padding selects it without opening its caption`, async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      const { index, modelSelection, root } = await openMediaDemo(
        page,
        `media-select:${type}-padding-click`,
        type
      );
      const media = root.locator(figure).first();
      const block = media.locator(
        'xpath=ancestor::*[@data-editor-node="element"][1]'
      );

      await block.scrollIntoViewIfNeeded();

      const box = await block.boundingBox();

      if (!box) throw new Error(`${type} block has no box`);

      await page.mouse.click(box.x + box.width / 2, box.y + 2);
      await expect.poll(modelSelection).toMatchObject({
        kind: 'node',
        mode: 'object',
        paths: [[index]],
      });
      await expect(media.locator('figcaption')).toBeHidden();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
}
