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

test('file paste starts after placeholder commit and aborts cleanly on undo', async ({
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
        children: [
          { type: 'paragraph' },
          { mediaType: 'image', type: 'placeholder' },
        ],
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
          naturalHeight: 60,
          naturalWidth: 80,
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
