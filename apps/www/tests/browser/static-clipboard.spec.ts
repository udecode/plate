import { createBrowserEditorHarness } from '@platejs/test/playwright';
import { expect, type Locator, test } from '@playwright/test';

const selectText = async (
  marker: Locator,
  startOffset: number,
  endOffset: number
) => {
  await marker.evaluate(
    (element, offsets) => {
      const text = element.firstChild;

      if (!text) throw new Error('Expected a static text marker.');

      const range = element.ownerDocument.createRange();

      range.setStart(text, offsets.startOffset);
      range.setEnd(text, offsets.endOffset);
      const selection = element.ownerDocument.getSelection();

      if (!selection) throw new Error('Expected an owner-document selection.');

      selection.removeAllRanges();
      selection.addRange(range);
    },
    { endOffset, startOffset }
  );
};

const decodeFragment = (fragment: string | null) => {
  if (!fragment) throw new Error('Expected an exact editor fragment.');

  return JSON.parse(
    decodeURIComponent(Buffer.from(fragment, 'base64').toString())
  ) as {
    slice: {
      content: unknown[];
      roots?: Record<string, unknown[]>;
    };
    version: number;
  };
};

test('EditorPreview copies exact model slices from its own document realm', async ({
  page,
}) => {
  await page.goto('/blocks/clipboard-static-proof');

  const first = page.getByTestId('static-preview-first');
  const second = page.getByTestId('static-preview-second');

  await expect(first).toBeVisible();
  await expect(second).toBeVisible();

  const firstHarness = createBrowserEditorHarness(
    page,
    'static-preview-first',
    first
  );
  const secondHarness = createBrowserEditorHarness(
    page,
    'static-preview-second',
    second
  );
  const decorated = first.locator(
    '[data-editor-node="text"][data-editor-path="0,0"][data-editor-root="main"] [data-editor-string]'
  );

  await expect(decorated).toHaveCount(3);
  await decorated.first().evaluate((element) => {
    const textOwner = element.closest('[data-editor-node="text"]');
    const start = element.firstChild;
    const end = textOwner
      ?.querySelectorAll('[data-editor-string]')
      .item(2).firstChild;

    if (!start || !end) throw new Error('Expected decorated static markers.');

    const range = element.ownerDocument.createRange();

    range.setStart(start, 1);
    range.setEnd(end, 1);
    const selection = element.ownerDocument.getSelection()!;

    selection.removeAllRanges();
    selection.addRange(range);
  });

  const wrongHost = await secondHarness.clipboard.copyEventPayload();

  expect(wrongHost.types).toEqual([]);

  const partial = await firstHarness.clipboard.copyEventPayload();

  expect(partial.text).toBe('bcde');
  expect(partial.html).toContain('data-editor-fragment');
  expect(decodeFragment(partial.fragment ?? null).slice.content).toEqual([
    { children: [{ text: 'bcde' }], type: 'paragraph' },
  ]);

  const empty = first.locator(
    '[data-editor-node="text"][data-editor-path="1,0"][data-editor-root="main"] [data-editor-string]'
  );

  await selectText(empty, 0, 1);
  const emptyPayload = await firstHarness.clipboard.copyEventPayload();

  expect(emptyPayload.text).toBe('');
  expect(emptyPayload.types).toContain('text/html');
  expect(emptyPayload.html ?? '').not.toContain('\uFEFF');
  expect(decodeFragment(emptyPayload.fragment ?? null).slice.content).toEqual([
    { children: [{ text: '' }], type: 'paragraph' },
  ]);

  const figure = first.locator('[data-editor-void="true"]');

  await figure.evaluate((element) => {
    const range = element.ownerDocument.createRange();

    range.selectNode(element);
    const selection = element.ownerDocument.getSelection()!;

    selection.removeAllRanges();
    selection.addRange(range);
  });
  const copiedFigure = await firstHarness.clipboard.copyEventPayload();
  const figurePayload = decodeFragment(copiedFigure.fragment ?? null);

  expect(figurePayload.slice.roots?.['clipboard-static-caption']).toEqual([
    { children: [{ text: 'Root caption' }], type: 'paragraph' },
  ]);

  const frame = page.frameLocator('iframe[title="Static clipboard frame"]');
  const framedPreview = frame.getByTestId('static-preview-frame');

  await expect(framedPreview).toBeVisible();
  const framedMarker = framedPreview.locator(
    '[data-editor-node="text"][data-editor-path="0,0"][data-editor-root="main"] [data-editor-string]'
  );

  await selectText(framedMarker.first(), 1, 2);
  const framedHarness = createBrowserEditorHarness(
    page,
    'static-preview-frame',
    framedPreview
  );
  const framedPayload = await framedHarness.clipboard.copyEventPayload();

  expect(framedPayload.text).toBe('b');
  expect(decodeFragment(framedPayload.fragment ?? null).slice.content).toEqual([
    { children: [{ text: 'b' }], type: 'paragraph' },
  ]);
});
