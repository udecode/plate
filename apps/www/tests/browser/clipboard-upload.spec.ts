import { createBrowserEditorHarness } from '@platejs/test/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

type ClipboardUploadProofWindow = Window & {
  __clipboardUploadProof?: {
    aborted: boolean;
    exactFile: boolean;
    fileName: string | null;
    pastedFile: File | null;
    resolve: (() => void) | null;
    starts: number;
  };
};

const openProof = async (page: Page) => {
  await page.goto('/blocks/clipboard-upload-proof');
  const root = page.getByRole('textbox', { name: 'Upload clipboard proof' });
  const editor = createBrowserEditorHarness(page, 'clipboard-upload', root);

  await expect(root).toBeVisible();
  await editor.selection.selectDOM({
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });

  return { editor, root };
};

const pasteImageFile = async (root: Locator) =>
  root.evaluate((element: HTMLElement) => {
    const file = new File(['image bytes'], 'clipboard.png', {
      type: 'image/png',
    });
    const proofWindow = window as ClipboardUploadProofWindow;
    let proof = proofWindow.__clipboardUploadProof;

    if (!proof) {
      proof = {
        aborted: false,
        exactFile: false,
        fileName: null,
        pastedFile: null,
        resolve: null,
        starts: 0,
      };
      proofWindow.__clipboardUploadProof = proof;
    }

    proof.pastedFile = file;
    const data = new DataTransfer();

    data.items.add(file);
    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'clipboardData', { value: data });
    element.dispatchEvent(event);
  });

const getProof = async (page: Page) =>
  page.evaluate(() => {
    const proof = (window as ClipboardUploadProofWindow).__clipboardUploadProof;

    return proof
      ? {
          aborted: proof.aborted,
          exactFile: proof.exactFile,
          fileName: proof.fileName,
          starts: proof.starts,
        }
      : null;
  });

test('file paste starts after draft commit and aborts cleanly on undo', async ({
  page,
}) => {
  const { editor, root } = await openProof(page);

  await pasteImageFile(root);
  await expect
    .poll(async () => ({
      proof: await getProof(page),
      value: await editor.get.modelValue(),
    }))
    .toMatchObject({
      proof: {
        exactFile: true,
        fileName: 'clipboard.png',
        starts: 1,
      },
      value: {
        children: [{ type: 'paragraph' }, { kind: 'image', type: 'upload' }],
      },
    });

  await editor.undo();

  await expect.poll(() => getProof(page)).toMatchObject({ aborted: true });
  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [{ type: 'paragraph' }],
    });
  await page.evaluate(() =>
    (window as ClipboardUploadProofWindow).__clipboardUploadProof?.resolve?.()
  );
  await page.waitForTimeout(0);
  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [{ type: 'paragraph' }],
    });
});

const dropImageFile = async (page: Page, target: Locator) => {
  const box = await target.boundingBox();
  const dataTransfer = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();

    transfer.items.add(
      new File(['image bytes'], 'dropped.png', { type: 'image/png' })
    );

    return transfer;
  });

  expect(box).not.toBeNull();
  const event = {
    clientX: box!.x + box!.width / 2,
    clientY: box!.y + 2,
    dataTransfer,
  };
  await target.dispatchEvent('dragenter', event);
  await target.dispatchEvent('dragover', event);
  await target.dispatchEvent('drop', event);
};

test('a file dropped on the top half of a block lands before it', async ({
  page,
}) => {
  const { editor, root } = await openProof(page);

  await dropImageFile(page, root.locator('[data-editor-node-key]').first());

  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [
        { kind: 'image', type: 'upload' },
        { children: [{ text: 'target' }], type: 'paragraph' },
      ],
    });
  await expect
    .poll(() => getProof(page))
    .toMatchObject({
      fileName: 'dropped.png',
      starts: 1,
    });
});

test('a file drop leaves focus where it was', async ({ page }) => {
  const { root } = await openProof(page);
  const picker = page.getByTestId('upload-picker').locator('button').first();

  await picker.focus();
  await dropImageFile(page, root.locator('[data-editor-node-key]').first());

  await expect.poll(() => getProof(page)).toMatchObject({ starts: 1 });
  await expect(picker).toBeFocused();
});

test('file picker starts from the committed editor view', async ({ page }) => {
  const { editor } = await openProof(page);
  const chooserPromise = page.waitForEvent('filechooser');

  await page.getByTestId('upload-picker').locator('button').first().click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    buffer: Buffer.from('image bytes'),
    mimeType: 'image/png',
    name: 'picker.png',
  });

  await expect
    .poll(() => getProof(page))
    .toMatchObject({
      fileName: 'picker.png',
      starts: 1,
    });
  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [{ type: 'paragraph' }, { kind: 'image', type: 'upload' }],
    });
});

test('one undo removes a completed pasted upload', async ({ page }) => {
  const { editor, root } = await openProof(page);

  await pasteImageFile(root);
  await expect.poll(() => getProof(page)).toMatchObject({ starts: 1 });
  await page.evaluate(() =>
    (window as ClipboardUploadProofWindow).__clipboardUploadProof?.resolve?.()
  );
  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [
        { type: 'paragraph' },
        {
          type: 'image',
          url: 'https://example.test/clipboard-upload.png',
        },
      ],
    });

  await editor.undo();

  await expect
    .poll(() => editor.get.modelValue())
    .toMatchObject({
      children: [{ type: 'paragraph' }],
    });
});
