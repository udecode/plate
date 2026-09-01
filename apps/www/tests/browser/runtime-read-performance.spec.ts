import {
  createPliteBrowserEditorHarness,
  measurePliteTrustedTyping,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const EDITOR_ROOT = '[data-plite-editor="true"][contenteditable="true"]';
const FRAME_BUDGET_MS = 16.67;
const MEASURED_TEXT = 'qwertyuiopasdfghjklz';
const CASES = [
  { offset: 'This is editable '.length, route: 'find-demo' },
  { offset: 0, route: 'list-demo' },
  { offset: 0, route: 'code-drawing-demo' },
  { offset: 0, route: 'copilot-demo' },
  { offset: 0, route: 'excalidraw-demo' },
] as const;
const percentile = (values: readonly number[], ratio: number) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)
  ];
};

test.describe('runtime read interaction performance', () => {
  for (const { offset, route } of CASES) {
    test(`${route}: trusted typing burst stays bounded`, async ({ page }) => {
      const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

      try {
        await page.goto(`/blocks/${route}`, { waitUntil: 'commit' });
        const root = page.locator(EDITOR_ROOT).first();
        const editor = createPliteBrowserEditorHarness(
          page,
          `runtime-read-performance:${route}`,
          root
        );

        await editor.ready({ editor: 'visible' });
        await editor.selection.collapse({ offset, path: [0, 0] });
        await editor.focus();
        await editor.type('zz');
        const beforeMeasuredBlocks = await editor.get.modelBlockTexts();

        const result = await measurePliteTrustedTyping({
          delay: 0,
          page,
          root,
          text: MEASURED_TEXT,
        });
        const domReadyDurations = result.rows.map(
          (row) => row.domReady! - row.keydown
        );
        const paintDurations = result.rows.map(
          (row) => row.paint! - row.keydown
        );
        const burstDuration =
          Math.max(...result.rows.map((row) => row.paint!)) -
          Math.min(...result.rows.map((row) => row.keydown));
        const expectedBlocks = [...beforeMeasuredBlocks];

        expectedBlocks[0] = `${expectedBlocks[0].slice(
          0,
          offset + 2
        )}${MEASURED_TEXT}${expectedBlocks[0].slice(offset + 2)}`;

        expect(result.rows).toHaveLength(20);
        const trustedRowsAreComplete = result.rows.every(
          (row) =>
            row.trustedKey &&
            row.trustedBeforeInput &&
            row.beforeInputDataMatched &&
            row.modelSelectionMatched &&
            row.runtimeTargetMatched &&
            (row.inputOwnership === 'model-owned' ||
              (row.inputOwnership === 'native-allowed' &&
                row.nativeTargetRangeMatched)) &&
            row.domTextInsertionMatched &&
            row.modelTextInsertionMatched &&
            row.domReady !== undefined &&
            row.paint !== undefined &&
            row.paint >= row.domReady
        );

        expect(trustedRowsAreComplete, JSON.stringify(result.rows)).toBe(true);
        expect(percentile(domReadyDurations, 0.95)).toBeLessThan(20);
        expect(percentile(paintDurations, 0.95)).toBeLessThan(50);
        expect(burstDuration).toBeLessThan(
          MEASURED_TEXT.length * FRAME_BUDGET_MS + 40
        );
        expect(result.longTasksSupported).toBe(true);
        expect(result.longTasks.filter((duration) => duration >= 50)).toEqual(
          []
        );
        await editor.assert.modelBlockTexts(expectedBlocks);
        runtimeErrors.assertNone();
      } finally {
        runtimeErrors.stop();
      }
    });
  }
});
