import { readFileSync } from 'node:fs';

import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test, type Page } from '@playwright/test';

const mockFilesGateway = async (page: Page, { bytes }: { bytes: Buffer }) => {
  const methods: string[] = [];
  const operations: string[] = [];

  await page.route('**/api/files?**', async (route) => {
    const request = route.request();
    const method = request.method();
    methods.push(method);
    const url = new URL(request.url());

    if (method === 'PUT') {
      operations.push(`put:${url.searchParams.get('key')}`);
      expect(request.postDataBuffer()).toEqual(bytes);
      await route.fulfill({ status: 200, body: '' });
      return;
    }
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        body: bytes,
        contentType: 'image/png',
      });
      return;
    }

    const body = request.postDataJSON();
    if (body.op === 'presign') {
      expect(body.files).toHaveLength(1);
      expect(body.files[0]).toMatchObject({ size: bytes.length });
      const key = body.files[0].name;
      operations.push(`presign:${key}`);
      url.searchParams.set('op', 'proxy');
      url.searchParams.set('key', key);
      await route.fulfill({
        status: 200,
        json: {
          uploads: [
            {
              id: `browser-proof-${key}`,
              key,
              target: {
                method: 'PUT',
                url: url.href,
                headers: { 'content-type': 'image/png' },
              },
            },
          ],
        },
      });
      return;
    }
    if (body.op === 'complete') {
      const key = body.completions?.[0]?.key;

      if (!key) {
        throw new Error(`Unexpected complete body: ${JSON.stringify(body)}`);
      }
      operations.push(`complete:${key}`);

      await route.fulfill({
        status: 200,
        json: {
          files: [
            {
              key,
              name: key,
              size: bytes.length,
              type: 'image/png',
              etag: 'browser-proof-etag',
              lastModified: 1,
            },
          ],
        },
      });
      return;
    }
    throw new Error(`Unexpected Files SDK operation: ${body.op}`);
  });

  return { methods, operations };
};

test('copied picker uploads through the Files SDK XHR path and completes a draft', async ({
  page,
}) => {
  const bytes = Buffer.from('image bytes');
  const gateway = await mockFilesGateway(page, { bytes });

  await page.goto('/blocks/files-sdk-proof');
  const root = page.getByRole('textbox', { name: 'Files SDK proof' });
  const editor = createBrowserEditorHarness(page, 'Files SDK proof', root);
  await expect(root).toBeVisible();
  await editor.selection.selectDOM({
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });

  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId('files-sdk-picker').locator('button').first().click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    buffer: Buffer.from('image bytes'),
    mimeType: 'image/png',
    name: 'picker.png',
  });

  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [
        { type: 'paragraph' },
        { type: 'image', url: expect.stringContaining('/api/files?') },
      ],
    });
  expect(gateway.methods.filter((method) => method !== 'GET')).toEqual([
    'POST',
    'PUT',
    'POST',
  ]);
});

test('local playground completes and deletes an R2-backed image from a physical click', async ({
  page,
}) => {
  const bytes = readFileSync('public/favicon-48x48.png');
  const gateway = await mockFilesGateway(page, { bytes });

  await page.goto('/blocks/playground', { waitUntil: 'commit' });
  const root = page.locator('[data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'playground R2 upload', root);
  const modelSelection = () =>
    root.evaluate((element) =>
      (
        element as HTMLElement & {
          __pliteBrowserHandle?: { getModelSelection: () => unknown };
        }
      ).__pliteBrowserHandle?.getModelSelection()
    );
  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await editor.selection.collapse({ path: [0, 0], offset: 32 });

  const chooserPromise = page.waitForEvent('filechooser');
  await page.locator('button:has(svg.lucide-image)').first().click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    buffer: bytes,
    mimeType: 'image/png',
    name: 'local-r2.png',
  });

  const image = root.locator('img[src*="/api/files?"]');
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element) => {
        if (!(element instanceof HTMLImageElement)) return 0;

        return element.naturalWidth;
      })
    )
    .toBe(48);
  await expect(root.getByRole('button', { name: 'Cancel upload' })).toHaveCount(
    0
  );
  expect(gateway.methods.filter((method) => method !== 'GET')).toEqual([
    'POST',
    'PUT',
    'POST',
  ]);

  const value = (await editor.get.modelValue()) as {
    children: Array<{ type?: string }>;
  };
  const imagePath = [value.children.findIndex((node) => node.type === 'image')];
  const imageBox = await image.boundingBox();

  expect(imagePath[0]).toBeGreaterThanOrEqual(0);
  expect(imageBox).not.toBeNull();

  await page.evaluate(() => {
    const trace: Array<{
      defaultPrevented: boolean;
      draggable: boolean;
      type: string;
    }> = [];
    (
      window as typeof window & {
        __uploadedImageClickTrace?: typeof trace;
      }
    ).__uploadedImageClickTrace = trace;

    for (const type of ['pointerdown', 'mousedown', 'click']) {
      document.addEventListener(type, (event) => {
        if (event.target instanceof HTMLImageElement) {
          trace.push({
            defaultPrevented: event.defaultPrevented,
            draggable: event.target.draggable,
            type,
          });
        }
      });
    }
  });
  await page.mouse.move(
    imageBox!.x + imageBox!.width / 2,
    imageBox!.y + imageBox!.height / 2
  );
  await page.mouse.down();
  await page.mouse.up();
  const selectionAfterClick = await modelSelection();
  const domSelectionAfterClick = await editor.get.domSelection();
  const clickTrace = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __uploadedImageClickTrace?: Array<{
            defaultPrevented: boolean;
            draggable: boolean;
            type: string;
          }>;
        }
      ).__uploadedImageClickTrace ?? []
  );

  expect(selectionAfterClick).toMatchObject({
    kind: 'node',
    paths: [imagePath],
  });
  expect(domSelectionAfterClick).toBeNull();
  expect(clickTrace).toEqual([
    { defaultPrevented: false, draggable: true, type: 'pointerdown' },
    { defaultPrevented: false, draggable: true, type: 'mousedown' },
    { defaultPrevented: false, draggable: true, type: 'click' },
  ]);
  await expect(image).toHaveClass(/ring-2/);

  const caption = image.locator('xpath=ancestor::figure[1]/figcaption');

  await expect(caption).toBeVisible();
  await caption.click();
  expect(await modelSelection()).toMatchObject({
    anchor: { path: [...imagePath, 0] },
    focus: { path: [...imagePath, 0] },
  });

  await image.click();
  await page.evaluate(() => {
    Reflect.set(window, '__uploadedImageDragStarted', false);
    document.addEventListener(
      'dragstart',
      (event) => {
        if (event.target instanceof HTMLImageElement) {
          Reflect.set(window, '__uploadedImageDragStarted', true);
        }
      },
      { capture: true, once: true }
    );
  });
  const dragBox = await image.boundingBox();

  expect(dragBox).not.toBeNull();
  await page.mouse.move(
    dragBox!.x + dragBox!.width / 2,
    dragBox!.y + dragBox!.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    dragBox!.x + dragBox!.width / 2 + 12,
    dragBox!.y + dragBox!.height / 2,
    { steps: 4 }
  );
  await expect
    .poll(() =>
      page.evaluate(() => Reflect.get(window, '__uploadedImageDragStarted'))
    )
    .toBe(true);
  await page.mouse.up();

  await image.click();
  expect(await modelSelection()).toMatchObject({
    kind: 'node',
    paths: [imagePath],
  });

  await page.keyboard.press('Backspace');
  await expect(image).toHaveCount(0);
});

test('dropping three filesystem images completes without DOM ownership errors', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);
  const bytes = readFileSync('public/favicon-48x48.png');

  try {
    const gateway = await mockFilesGateway(page, { bytes });
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const root = page.locator('[data-editor="true"]').first();
    const editor = createBrowserEditorHarness(
      page,
      'playground three-image drop',
      root
    );
    await editor.ready({
      editor: 'visible',
      text: 'Welcome to the Plate Playground!',
    });
    const initialValue = (await editor.get.modelValue()) as {
      children: Array<{ type?: string }>;
    };
    const initialImageCount = initialValue.children.filter(
      (node) => node.type === 'image'
    ).length;

    const target = root.locator('[data-editor-node-key]').first();
    const targetBox = await target.boundingBox();
    const dataTransfer = await page.evaluateHandle(
      ({ encoded }) => {
        const binary = atob(encoded);
        const data = Uint8Array.from(binary, (character) =>
          character.charCodeAt(0)
        );
        const transfer = new DataTransfer();

        for (const name of ['drop-1.png', 'drop-2.png', 'drop-3.png']) {
          transfer.items.add(new File([data], name, { type: 'image/png' }));
        }

        return transfer;
      },
      { encoded: bytes.toString('base64') }
    );

    expect(targetBox).not.toBeNull();
    const event = {
      clientX: targetBox!.x + targetBox!.width / 2,
      clientY: targetBox!.y + targetBox!.height / 2,
      dataTransfer,
    };
    await target.dispatchEvent('dragenter', event);
    await target.dispatchEvent('dragover', event);
    await target.dispatchEvent('drop', event);

    const expectedOperations = ['drop-1.png', 'drop-2.png', 'drop-3.png']
      .flatMap((name) => [`complete:${name}`, `presign:${name}`, `put:${name}`])
      .sort();
    await expect
      .poll(async () => {
        const value = (await editor.get.modelValue()) as {
          children: Array<{ type?: string }>;
        };

        return {
          drafts: value.children.filter((node) => node.type === 'upload')
            .length,
          images: value.children.filter((node) => node.type === 'image').length,
          operations: [...gateway.operations].sort(),
        };
      })
      .toMatchObject({
        drafts: 0,
        images: initialImageCount + 3,
        operations: expectedOperations,
      });
    await expect(
      root.getByRole('button', { name: 'Cancel upload' })
    ).toHaveCount(0);
    const value = (await editor.get.modelValue()) as {
      children: Array<{ type?: string }>;
    };

    expect(value.children.filter((node) => node.type === 'image')).toHaveLength(
      initialImageCount + 3
    );
    expect(gateway.operations.sort()).toEqual(expectedOperations);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
