import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';
import { expect, test, type Page } from '@playwright/test';

type DragOptions = {
  cancelBeforeDrop?: boolean;
  copy?: boolean;
  dropPayload?: 'empty' | 'external' | 'source';
  editSource?: boolean;
};

const openCrossEditorDrag = async (page: Page) => {
  await page.goto('/examples/plite/cross-editor-drag');

  const sourceRoot = page.getByRole('textbox', {
    name: 'Drag source editor',
  });
  const targetRoot = page.getByRole('textbox', {
    name: 'Drag target editor',
  });
  const bystanderRoot = page.getByRole('textbox', {
    name: 'Drag bystander editor',
  });

  await expect(sourceRoot).toBeVisible();
  await expect(targetRoot).toBeVisible();
  await expect(bystanderRoot).toBeVisible();

  const source = createPliteBrowserEditorHarness(
    page,
    'cross-editor-drag-source',
    sourceRoot
  );
  const target = createPliteBrowserEditorHarness(
    page,
    'cross-editor-drag-target',
    targetRoot
  );
  const bystander = createPliteBrowserEditorHarness(
    page,
    'cross-editor-drag-bystander',
    bystanderRoot
  );

  await source.ready({ editor: 'visible' });
  await target.ready({ editor: 'visible' });
  await bystander.ready({ editor: 'visible' });
  await source.selection.selectDOM({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 'Alpha '.length },
  });

  return {
    bystander,
    bystanderRoot,
    source,
    sourceRoot,
    target,
    targetRoot,
  };
};

const dispatchSelectedTextDrag = async (
  sourceRoot: Awaited<ReturnType<typeof openCrossEditorDrag>>['sourceRoot'],
  {
    cancelBeforeDrop = false,
    copy = false,
    dropPayload = 'source',
    editSource = false,
  }: DragOptions = {}
) =>
  sourceRoot.evaluate(
    (
      sourceElement: HTMLElement,
      options: Required<DragOptions> & { targetLabel: string }
    ) => {
      const targetElement = sourceElement.ownerDocument.querySelector(
        `[aria-label="${options.targetLabel}"]`
      );

      if (!(targetElement instanceof HTMLElement)) {
        throw new Error('Missing cross-editor drag target');
      }

      const pointForOffset = (element: HTMLElement, offset: number) => {
        const walker = element.ownerDocument.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );
        let remaining = offset;

        while (walker.nextNode()) {
          const node = walker.currentNode;
          const length = node.textContent?.length ?? 0;

          if (remaining <= length) {
            const range = element.ownerDocument.createRange();

            range.setStart(node, remaining);
            range.collapse(true);

            const rect = range.getBoundingClientRect();

            return {
              target:
                element.ownerDocument.elementFromPoint(
                  rect.left,
                  rect.top + rect.height / 2
                ) ?? element,
              x: rect.left,
              y: rect.top + rect.height / 2,
            };
          }

          remaining -= length;
        }

        throw new Error(`Missing drag point at offset ${offset}`);
      };

      const dragPoint = pointForOffset(sourceElement, 1);
      const dropPoint = pointForOffset(targetElement, 'Charlie'.length);
      const sourceData = new DataTransfer();
      const dropData =
        options.dropPayload === 'source' ? sourceData : new DataTransfer();

      dragPoint.target.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          clientX: dragPoint.x,
          clientY: dragPoint.y,
          dataTransfer: sourceData,
        })
      );

      if (options.editSource) {
        const handle = (
          sourceElement as HTMLElement & {
            __pliteBrowserHandle?: {
              insertTextAt: (
                text: string,
                at: { offset: number; path: number[] }
              ) => void;
            };
          }
        ).__pliteBrowserHandle;

        if (!handle) {
          throw new Error('Missing source browser handle');
        }

        handle.insertTextAt('Zulu ', { offset: 0, path: [0, 0] });
      }

      if (options.dropPayload === 'external') {
        dropData.setData('text/plain', 'Delta');
      }
      if (options.copy) {
        dropData.dropEffect = 'copy';
      }
      const copyModifiers = options.copy
        ? /Mac|iPad|iPhone|iPod/.test(navigator.platform)
          ? { altKey: true }
          : { ctrlKey: true }
        : {};
      if (options.cancelBeforeDrop) {
        dragPoint.target.dispatchEvent(
          new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            clientX: dropPoint.x,
            clientY: dropPoint.y,
            dataTransfer: sourceData,
          })
        );
      }

      dropPoint.target.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          clientX: dropPoint.x,
          clientY: dropPoint.y,
          dataTransfer: dropData,
          ...copyModifiers,
        })
      );
      dropPoint.target.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          clientX: dropPoint.x,
          clientY: dropPoint.y,
          dataTransfer: dropData,
          ...copyModifiers,
        })
      );

      if (!options.cancelBeforeDrop) {
        dragPoint.target.dispatchEvent(
          new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            clientX: dropPoint.x,
            clientY: dropPoint.y,
            dataTransfer: sourceData,
          })
        );
      }

      return {
        text: dropData.getData('text/plain'),
        types: [...dropData.types],
      };
    },
    {
      cancelBeforeDrop,
      copy,
      dropPayload,
      editSource,
      targetLabel: 'Drag target editor',
    }
  );

test.describe('cross-editor selected-text drag', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop drag/drop proof');
  });

  test('moves the source range and remains interactive', async ({ page }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      const {
        bystander,
        bystanderRoot,
        source,
        sourceRoot,
        target,
        targetRoot,
      } =
        await openCrossEditorDrag(page);
      const payload = await dispatchSelectedTextDrag(sourceRoot);

      expect(payload.types).toContain('application/x-plite-fragment');
      expect(payload.text).toBe('Alpha ');
      await expect.poll(() => source.get.modelText()).toBe('Bravo');
      await expect.poll(() => target.get.modelText()).toContain('Alpha ');
      await expect.poll(() => bystander.get.modelText()).toBe('Echo');
      await expect(sourceRoot).toHaveText('Bravo');
      await expect(targetRoot).toContainText('Alpha ');
      await expect(bystanderRoot).toHaveText('Echo');
      const targetTextAfterDrop = await target.get.modelText();

      await target.press('End');
      await page.keyboard.type('!');
      await expect
        .poll(() => target.get.modelText())
        .toBe(`${targetTextAfterDrop}!`);
      await expect(targetRoot).toHaveText(`${targetTextAfterDrop}!`);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('copies when the resolved drop effect is copy', async ({ page }) => {
    const {
      bystander,
      bystanderRoot,
      source,
      sourceRoot,
      target,
      targetRoot,
    } =
      await openCrossEditorDrag(page);

    await dispatchSelectedTextDrag(sourceRoot, { copy: true });

    await expect.poll(() => source.get.modelText()).toBe('Alpha Bravo');
    await expect.poll(() => target.get.modelText()).toContain('Alpha ');
    await expect.poll(() => bystander.get.modelText()).toBe('Echo');
    await expect(sourceRoot).toHaveText('Alpha Bravo');
    await expect(targetRoot).toContainText('Alpha ');
    await expect(bystanderRoot).toHaveText('Echo');
  });

  test('degrades to copy after the source document changes', async ({
    page,
  }) => {
    const {
      bystander,
      bystanderRoot,
      source,
      sourceRoot,
      target,
      targetRoot,
    } =
      await openCrossEditorDrag(page);

    await dispatchSelectedTextDrag(sourceRoot, { editSource: true });

    await expect.poll(() => source.get.modelText()).toBe('Zulu Alpha Bravo');
    await expect.poll(() => target.get.modelText()).toContain('Alpha ');
    await expect.poll(() => bystander.get.modelText()).toBe('Echo');
    await expect(sourceRoot).toHaveText('Zulu Alpha Bravo');
    await expect(targetRoot).toContainText('Alpha ');
    await expect(bystanderRoot).toHaveText('Echo');
  });

  test('leaves the source alone for empty and external transfers', async ({
    page,
  }) => {
    for (const dropPayload of ['empty', 'external'] as const) {
      const {
        bystander,
        bystanderRoot,
        source,
        sourceRoot,
        target,
        targetRoot,
      } =
        await openCrossEditorDrag(page);

      await dispatchSelectedTextDrag(sourceRoot, { dropPayload });

      await expect.poll(() => source.get.modelText()).toBe('Alpha Bravo');
      await expect.poll(() => bystander.get.modelText()).toBe('Echo');
      await expect
        .poll(() => target.get.modelText())
        .toBe(dropPayload === 'empty' ? 'Charlie' : 'CharlieDelta');
      await expect(sourceRoot).toHaveText('Alpha Bravo');
      await expect(bystanderRoot).toHaveText('Echo');
      await expect(targetRoot).toHaveText(
        dropPayload === 'empty' ? 'Charlie' : 'CharlieDelta'
      );
    }
  });

  test('dragend clears source deletion authority before a later drop', async ({
    page,
  }) => {
    const {
      bystander,
      bystanderRoot,
      source,
      sourceRoot,
      target,
      targetRoot,
    } =
      await openCrossEditorDrag(page);

    await dispatchSelectedTextDrag(sourceRoot, { cancelBeforeDrop: true });

    await expect.poll(() => source.get.modelText()).toBe('Alpha Bravo');
    await expect.poll(() => target.get.modelText()).toContain('Alpha ');
    await expect.poll(() => bystander.get.modelText()).toBe('Echo');
    await expect(sourceRoot).toHaveText('Alpha Bravo');
    await expect(targetRoot).toContainText('Alpha ');
    await expect(bystanderRoot).toHaveText('Echo');
  });
});
