import { expect, test } from '@playwright/test';
import {
  openExample,
  type PliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

type NativeCaretFixture = Readonly<{
  backwardKey: 'ArrowLeft' | 'ArrowRight';
  direction: 'ltr' | 'rtl';
  forwardKey: 'ArrowLeft' | 'ArrowRight';
  label: string;
  minimumDistinctOffsets: number;
  stableOffsets: readonly number[];
  text: string;
}>;

const plaintextFixtures: readonly NativeCaretFixture[] = [
  {
    backwardKey: 'ArrowLeft',
    direction: 'ltr',
    forwardKey: 'ArrowRight',
    label: 'LTR container with Hebrew, brackets, isolate, and ZWJ emoji',
    minimumDistinctOffsets: 13,
    stableOffsets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 21, 22],
    text: 'a [אב] \u2066cd\u2069 👩‍❤️‍👨 z',
  },
  {
    backwardKey: 'ArrowRight',
    direction: 'rtl',
    forwardKey: 'ArrowLeft',
    label: 'RTL container with Latin, brackets, isolate, and ZWJ emoji',
    minimumDistinctOffsets: 13,
    stableOffsets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 20, 21, 22],
    text: 'א [ab] \u2067גד\u2069 👩‍❤️‍👨 ת',
  },
];

const normalizeText = (text: null | string | undefined) =>
  text?.replaceAll('\uFEFF', '') ?? null;

const expectSynchronizedCaret = async (
  editor: PliteBrowserEditorHarness,
  leaves: readonly string[],
  stableOffsets: readonly number[]
) => {
  await expect
    .poll(async () => {
      const [model, dom] = await Promise.all([
        editor.selection.get(),
        editor.selection.dom(),
      ]);

      if (
        model?.kind !== 'text' ||
        !dom ||
        model.anchor.path.length !== 2 ||
        model.anchor.path[0] !== 0 ||
        model.anchor.path.join('.') !== model.focus.path.join('.') ||
        model.anchor.offset !== model.focus.offset ||
        dom.anchorOffset !== dom.focusOffset
      ) {
        return false;
      }

      const leaf = leaves[model.anchor.path[1]!];

      return (
        leaf !== undefined &&
        normalizeText(dom.anchorNodeText) === leaf &&
        normalizeText(dom.focusNodeText) === leaf &&
        dom.anchorOffset === model.anchor.offset
      );
    })
    .toBe(true);

  const model = await editor.selection.get();

  expect(model?.kind).toBe('text');
  expect(model?.anchor).toEqual(model?.focus);

  const leafIndex = model!.anchor.path[1]!;
  const globalOffset =
    leaves.slice(0, leafIndex).reduce((total, leaf) => total + leaf.length, 0) +
    model!.anchor.offset;

  expect(stableOffsets).toContain(globalOffset);
  await expect.poll(() => editor.get.selectedText()).toBe('');

  return globalOffset;
};

const traverseNativeCaret = async ({
  editor,
  key,
  leaves,
  stableOffsets,
  terminalOffset,
}: {
  editor: PliteBrowserEditorHarness;
  key: 'ArrowLeft' | 'ArrowRight';
  leaves: readonly string[];
  stableOffsets: readonly number[];
  terminalOffset: number;
}) => {
  const visited = [
    await expectSynchronizedCaret(editor, leaves, stableOffsets),
  ];
  const maxSteps = stableOffsets.at(-1)! * 3 + 12;

  for (let index = 0; index < maxSteps; index++) {
    if (visited.at(-1) === terminalOffset) break;

    await editor.page.keyboard.press(key);
    visited.push(await expectSynchronizedCaret(editor, leaves, stableOffsets));
  }

  expect(
    visited.at(-1),
    `${key} traversal did not reach ${terminalOffset}: ${visited.join(',')}`
  ).toBe(terminalOffset);

  await editor.page.keyboard.press(key);
  expect(await expectSynchronizedCaret(editor, leaves, stableOffsets)).toBe(
    terminalOffset
  );

  return visited;
};

test.describe('browser-native mixed-bidi caret proof', () => {
  test.beforeEach(
    async ({ page }) => await page.goto('/examples/plite/plaintext')
  );

  for (const fixture of plaintextFixtures) {
    test(fixture.label, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name === 'mobile',
        'Desktop native caret proof'
      );
      test.setTimeout(60_000);

      const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
      const editor = await openExample(page, 'plite/plaintext', {
        ready: {
          editor: 'visible',
        },
      });

      try {
        await editor.selection.selectAll();
        await page.keyboard.insertText(fixture.text);
        await expect.poll(() => editor.get.modelText()).toBe(fixture.text);
        await editor.root.evaluate((element: HTMLElement, direction) => {
          element.dir = direction;
        }, fixture.direction);
        await editor.selection.selectDOM({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
        await editor.focus();

        const forward = await traverseNativeCaret({
          editor,
          key: fixture.forwardKey,
          leaves: [fixture.text],
          stableOffsets: fixture.stableOffsets,
          terminalOffset: fixture.text.length,
        });
        const backward = await traverseNativeCaret({
          editor,
          key: fixture.backwardKey,
          leaves: [fixture.text],
          stableOffsets: fixture.stableOffsets,
          terminalOffset: 0,
        });

        expect(new Set(forward).size).toBeGreaterThanOrEqual(
          fixture.minimumDistinctOffsets
        );
        expect(new Set(backward).size).toBeGreaterThanOrEqual(
          fixture.minimumDistinctOffsets
        );
        await editor.assert.focusOwner('editor');
        await editor.assert.noDoubleSelectionHighlight();
        runtimeErrors.assertNone();
      } finally {
        await editor.root
          .evaluate((element: HTMLElement) => {
            element.removeAttribute('dir');
          })
          .catch(() => {});
        runtimeErrors.stop();
      }
    });
  }

  test('keeps native caret synchronized across a formatted mixed-bidi leaf split', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native caret proof');
    test.setTimeout(60_000);

    await page.goto('/examples/plite/richtext');

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const leaves = ['a [', 'אב', '] 👩‍❤️‍👨 z'] as const;
    const text = leaves.join('');
    const stableOffsets = [0, 1, 2, 3, 4, 5, 6, 7, 15, 16, 17] as const;

    try {
      await editor.selectAll();
      await editor.deleteFragment();
      await editor.insertText(text);
      await editor.selection.selectDOM({
        kind: 'text',
        anchor: { path: [0, 0], offset: leaves[0].length },
        focus: {
          path: [0, 0],
          offset: leaves[0].length + leaves[1].length,
        },
      });
      await page.getByTestId('mark-button-bold').click();
      await expect(editor.root.locator('strong')).toHaveText(leaves[1]);
      await expect.poll(() => editor.get.modelText()).toBe(text);
      await editor.root.evaluate((element: HTMLElement) => {
        element.dir = 'ltr';
      });
      await editor.selection.selectDOM({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await editor.focus();

      const forward = await traverseNativeCaret({
        editor,
        key: 'ArrowRight',
        leaves,
        stableOffsets,
        terminalOffset: text.length,
      });
      const backward = await traverseNativeCaret({
        editor,
        key: 'ArrowLeft',
        leaves,
        stableOffsets,
        terminalOffset: 0,
      });

      expect(new Set(forward).size).toBeGreaterThanOrEqual(9);
      expect(new Set(backward).size).toBeGreaterThanOrEqual(9);
      await editor.assert.focusOwner('editor');
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      await editor.root
        .evaluate((element: HTMLElement) => {
          element.removeAttribute('dir');
        })
        .catch(() => {});
      runtimeErrors.stop();
    }
  });
});
