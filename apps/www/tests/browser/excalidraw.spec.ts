import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';
import type { Value } from 'platejs';

type DrawingValue = { children: Value };
type BrowserHandleElement = HTMLElement & {
  __pliteBrowserHandle: {
    applyValueChange: (
      value: DrawingValue,
      policy?: { history: 'new-batch' }
    ) => void;
    getValue: () => DrawingValue;
    redo: () => void;
    undo: () => void;
  };
};

test('excalidraw: filters viewport state and projects document undo into the canvas', async ({
  page,
}, info) => {
  const errors = recordPliteBrowserRuntimeErrors(page);
  try {
    await page.goto('/blocks/excalidraw-demo', { waitUntil: 'commit' });
    const root = page.locator('.plite-editor').first();
    const editor = createPliteBrowserEditorHarness(
      page,
      'excalidraw:sync',
      root
    );
    await editor.ready({ editor: 'visible', text: 'Excalidraw' });
    const canvas = page.locator('canvas.excalidraw__canvas.static');
    await expect(canvas).toBeVisible();
    const color = () =>
      canvas.evaluate((element: HTMLCanvasElement) =>
        Array.from(element.getContext('2d')!.getImageData(2, 2, 1, 1).data)
      );
    await expect.poll(color).toEqual([175, 238, 238, 255]);

    const beforePan = await editor.get.modelValue();
    const hand = page.getByRole('radio', {
      name: 'Hand (panning tool) — H',
      exact: true,
    });
    await page.locator('label').filter({ has: hand }).click();
    await expect(hand).toBeChecked();
    const interactive = page.locator('canvas.excalidraw__canvas.interactive');
    await interactive.scrollIntoViewIfNeeded();
    const box = (await interactive.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 40,
      box.y + box.height / 2 + 30,
      { steps: 8 }
    );
    await page.mouse.up();
    expect(await editor.get.modelValue()).toEqual(beforePan);

    await root.evaluate((element) => {
      const handle = (element as BrowserHandleElement).__pliteBrowserHandle;
      const value = handle.getValue();
      const drawing = value.children.find(
        (node) => 'type' in node && node.type === 'excalidraw'
      )!;
      if (
        !('data' in drawing) ||
        !drawing.data ||
        typeof drawing.data !== 'object'
      ) {
        throw new Error('Drawing data missing');
      }
      handle.applyValueChange(
        {
          children: value.children.map((node) =>
            node === drawing
              ? {
                  ...drawing,
                  data: {
                    ...(drawing.data as object),
                    state: { viewBackgroundColor: '#ff0000' },
                  },
                }
              : node
          ),
        },
        { history: 'new-batch' }
      );
    });
    await expect.poll(color).toEqual([255, 0, 0, 255]);
    await root.evaluate((element) =>
      (element as BrowserHandleElement).__pliteBrowserHandle.undo()
    );
    await expect.poll(color).toEqual([175, 238, 238, 255]);
    await root.evaluate((element) =>
      (element as BrowserHandleElement).__pliteBrowserHandle.redo()
    );
    await expect.poll(color).toEqual([255, 0, 0, 255]);
    await expect(
      page.getByRole('button', { name: 'Undo', exact: true })
    ).toBeDisabled();

    const beforeDraw = (await editor.get.modelValue()) as DrawingValue;
    const rectangle = page.getByRole('radio', {
      name: 'Rectangle',
      exact: true,
    });
    await page.locator('label').filter({ has: rectangle }).click();
    await expect(rectangle).toBeChecked();
    await interactive.scrollIntoViewIfNeeded();
    const drawBox = (await interactive.boundingBox())!;
    await page.mouse.move(
      drawBox.x + drawBox.width * 0.7,
      drawBox.y + drawBox.height * 0.4
    );
    await page.mouse.down();
    await page.mouse.move(
      drawBox.x + drawBox.width * 0.9,
      drawBox.y + drawBox.height * 0.6,
      { steps: 8 }
    );
    await page.mouse.up();
    await expect.poll(() => editor.get.modelValue()).not.toEqual(beforeDraw);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as DrawingValue;
        const node = value.children.find(
          (entry) => 'type' in entry && entry.type === 'excalidraw'
        );
        return node &&
          'data' in node &&
          node.data &&
          typeof node.data === 'object' &&
          'elements' in node.data &&
          Array.isArray(node.data.elements)
          ? node.data.elements.length
          : null;
      })
      .toBe(2);

    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await expect(canvas).toBeVisible();
    await info.attach('excalidraw-mobile', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    errors.assertNone();
  } finally {
    errors.stop();
  }
});
