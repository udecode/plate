import {
  createBrowserEditorHarness,
  measureTrustedTyping,
  openExample,
  recordBrowserRuntimeErrors,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

import type { PliteBrowserHandle } from '../../../../packages/plitejs/src/react/editable/browser-handle';

const openReview = async (page: Page) => {
  const { errors } = recordBrowserRuntimeErrors(page, { strict: true });
  const proposed = await openExample(page, 'plite/authored-changes', {
    ready: { editor: 'visible' },
    surface: { scope: '#authored-proposed-surface' },
  });
  return {
    accepted: proposed.rootAt('[aria-label="Accepted document"]'),
    controls: page.locator('[aria-label="Proposed document controls"]'),
    errors,
    independent: proposed.rootAt('[aria-label="Independent document"]'),
    proposed,
  };
};

test.describe('native authored changes', () => {
  test('groups contiguous browser Backspaces into one pending proposal', async ({
    page,
  }) => {
    const { errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 15 });
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    await proposed.assert.modelBlockTexts([
      'A shared draf',
      'Select a phrase, type a replacement, and review the result.',
    ]);
    await expect(
      page.getByLabel('Pending proposals', { exact: true }).locator('li')
    ).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('large shared views preserve native input and reachable controls', async ({
    page,
  }) => {
    test.slow();

    const { accepted, controls, errors, proposed } = await openReview(page);
    await accepted.scenario.run('seed shared large document', [
      {
        kind: 'applyValueChange',
        value: {
          children: Array.from({ length: 1000 }, () => ({
            type: 'paragraph',
            children: [{ text: 'Seed.' }],
          })),
        },
      },
    ]);
    await proposed.root.evaluate((element) => {
      const handle = (
        element as HTMLElement & { __pliteBrowserHandle: PliteBrowserHandle }
      ).__pliteBrowserHandle;
      for (let index = 0; index < 1000; index++) {
        handle.deleteTextAt({
          anchor: { path: [index, 0], offset: 1 },
          focus: { path: [index, 0], offset: 2 },
        });
      }
    });
    for (const surface of [accepted, proposed]) {
      await expect
        .poll(() =>
          surface.root.evaluate((root) => {
            const column = root.closest('section')!.getBoundingClientRect();
            const box = root.getBoundingClientRect();
            return box.left >= column.left && box.right <= column.right;
          })
        )
        .toBe(true);
    }
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [999, 0], offset: 0 });
    await proposed.type('!');
    expect(await accepted.get.modelText()).toBe('Seed.'.repeat(1000));
    expect(await proposed.get.modelText()).toBe(`${'Sed.'.repeat(999)}!Sed.`);
    expect(errors).toEqual([]);
  });

  for (const projection of [
    'accepted',
    'proposed',
    'markup-inline',
    'markup-structure',
    'named-root',
  ] as const) {
    test(`measures trusted typing against the ${projection} view`, async ({
      page,
    }, info) => {
      const { controls, errors, proposed } = await openReview(page);
      if (projection === 'accepted') {
        await controls.getByRole('button', { name: 'Edit accepted' }).click();
        await proposed.selection.collapse({ path: [0, 0], offset: 0 });
      } else if (projection === 'proposed') {
        await proposed.selection.collapse({ path: [0, 0], offset: 2 });
        await proposed.type('!');
      } else if (projection === 'markup-inline') {
        await proposed.selection.select({
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 8 },
        });
        await page.keyboard.press('Backspace');
        await controls.getByRole('button', { name: 'Show changes' }).click();
        await proposed.selection.collapse({ path: [0, 0], offset: 0 });
      } else {
        await page
          .getByLabel('Sample document', { exact: true })
          .selectOption(
            projection === 'named-root' ? 'named-root' : 'two-quotes'
          );
        await proposed.selection.select({
          anchor: { path: [0, 0, 0], offset: 1 },
          focus: { path: [1, 0, 0], offset: 1 },
        });
        await page.keyboard.press('Backspace');
        await controls.getByRole('button', { name: 'Show changes' }).click();
        await proposed.selection.collapse({ path: [0, 0, 0], offset: 2 });
        await proposed.assert.domCaret({ text: 'D', offset: 1 });
      }
      const before = await proposed.get.modelText();
      const result = await measureTrustedTyping({
        page,
        root: proposed.root,
        text: 'qr',
      });
      await info.attach('authored-view-trusted-typing.json', {
        body: JSON.stringify({ projection, before, result }, null, 2),
        contentType: 'application/json',
      });
      expect(result.rows).toHaveLength(2);
      expect(
        result.rows.every(
          (row) =>
            row.trustedKey &&
            row.trustedBeforeInput &&
            row.beforeInputDataMatched &&
            row.modelSelectionMatched &&
            row.runtimeTargetMatched &&
            row.nativeTargetRangeMatched &&
            row.domTextInsertionMatched &&
            row.domSelectionInsertionMatched &&
            row.modelTextInsertionMatched &&
            row.paint !== undefined &&
            row.domReady !== undefined &&
            row.paint >= row.domReady
        )
      ).toBe(true);
      const after = await proposed.get.modelText();
      expect(after.replace('qr', '')).toBe(before);
      expect(errors).toEqual([]);
    });
  }

  for (const position of ['first', 'last', 'only'] as const) {
    test(`selects retained media at the ${position} document edge through native keys`, async ({
      page,
    }, info) => {
      test.skip(
        info.project.name === 'mobile',
        'Native clipboard shortcuts require a desktop browser.'
      );
      const { accepted, controls, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption(`media-${position}`);
      const media = proposed.root.locator('[data-authored-atomic="media"]');
      await media.click();
      await page.keyboard.press('Backspace');
      await expect(media).toHaveCount(0);
      await controls
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
      await expect(media).toHaveText('Preview');
      await proposed.root.focus();
      await page.keyboard.press('ControlOrMeta+a');
      await expect(media).toHaveAttribute('data-selected', 'true');
      const copied = await proposed.clipboard.copyNativeEventPayload();
      expect(copied.fragment).toBeTruthy();
      const fragment = JSON.parse(
        decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
      );
      expect(fragment.slice.content).toContainEqual({
        type: 'media',
        label: 'Preview',
        children: [{ text: '' }],
      });
      expect(copied.text.replaceAll('\n', '')).toBe(
        position === 'only' ? '' : 'AB'
      );
      await info.attach('retained-media-edge-clipboard.json', {
        body: JSON.stringify(fragment, null, 2),
        contentType: 'application/json',
      });
      if (position === 'only') {
        await info.attach('retained-media-selection.png', {
          body: await proposed.root.screenshot(),
          contentType: 'image/png',
        });
        const lock = page.getByLabel('Read-only proposed view', {
          exact: true,
        });
        await lock.check();
        await proposed.root.focus();
        const lockedCopy = await proposed.clipboard.copyNativeEventPayload();
        expect(lockedCopy.fragment).toBe(copied.fragment);
        await page.keyboard.type('X');
        await proposed.assert.modelBlockTexts([]);
        await lock.uncheck();
        await page
          .getByRole('button', { name: 'Reject all Alice', exact: true })
          .click();
        await proposed.assert.modelBlockTexts(['']);
        await expect(
          proposed.root.locator('[data-editor-retained]')
        ).toHaveCount(0);
      }
      if (position !== 'only') {
        await proposed.selection.collapse({
          path: [0, 0],
          offset: position === 'first' ? 0 : 2,
        });
        await page.keyboard.press(
          position === 'first' ? 'Shift+ArrowLeft' : 'Shift+ArrowRight'
        );
        await expect(media).toHaveAttribute('data-selected', 'true');
        const atom = await proposed.clipboard.copyNativeEventPayload();
        expect(atom.text).toBe('');
        expect(
          JSON.parse(
            decodeURIComponent(Buffer.from(atom.fragment!, 'base64').toString())
          ).slice.content
        ).toEqual([
          { type: 'media', label: 'Preview', children: [{ text: '' }] },
        ]);
        await page.keyboard.type('X');
        await proposed.assert.modelBlockTexts(['AB']);
        await page.keyboard.press(
          position === 'first' ? 'ArrowRight' : 'ArrowLeft'
        );
        await expect(media).toHaveAttribute('data-selected', 'false');
        await page.keyboard.type('!');
        await proposed.assert.modelBlockTexts([
          position === 'first' ? '!AB' : 'AB!',
        ]);
      }
      await expect(
        accepted.root.locator('[data-authored-atomic="media"]')
      ).toHaveText('Preview');
      expect(errors).toEqual([]);
    });
  }

  test('keeps retained atomic selection and copying when only the proposed view is read-only', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('atomics');
    await proposed.selection.collapse({ path: [0, 2], offset: 0 });
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    const lock = page.getByLabel('Read-only proposed view', { exact: true });
    await lock.check();
    await expect(proposed.root).toHaveAttribute('aria-readonly', 'true');
    await expect(accepted.root).not.toHaveAttribute('aria-readonly', 'true');
    await expect(
      controls.getByRole('button', { name: 'Undo', exact: true })
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Reject all Alice', exact: true })
    ).toBeDisabled();
    await proposed.root.locator('[data-editor-path="0,0"]').first().click();
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+End');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('AB');
    expect(copied.fragment).toBeTruthy();
    const fragment = JSON.parse(
      decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
    );
    expect(fragment.slice.content).toHaveLength(1);
    expect(fragment.slice.content[0].children).toContainEqual({
      type: 'mention',
      label: 'Alice',
      children: [{ text: '' }],
    });
    await page.keyboard.type('X');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('ControlOrMeta+z');
    await page.keyboard.press('ControlOrMeta+x');
    await proposed.assert.modelBlockTexts(['AB', '', 'CD']);
    await expect(
      proposed.root.locator(
        '[data-editor-retained] [data-authored-atomic="mention"]'
      )
    ).toHaveText('@Alice');
    await accepted.selection.collapse({ path: [2, 0], offset: 2 });
    await page.keyboard.type('!');
    await accepted.assert.modelBlockTexts(['AB', '', 'CD!']);
    await proposed.assert.modelBlockTexts(['AB', '', 'CD!']);
    await lock.uncheck();
    await expect(
      controls.getByRole('button', { name: 'Undo', exact: true })
    ).toBeEnabled();
    await proposed.selection.collapse({ path: [2, 0], offset: 3 });
    await page.keyboard.type('?');
    await proposed.assert.modelBlockTexts(['AB', '', 'CD!?']);
    await accepted.assert.modelBlockTexts(['AB', '', 'CD!']);
    expect(errors).toEqual([]);
  });

  test('selects a retained mention as one native character in both directions', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('atomics');
    await proposed.selection.collapse({ path: [0, 2], offset: 0 });
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    for (const direction of ['Right', 'Left']) {
      await page.keyboard.press(`Shift+Arrow${direction}`);
      await expect(
        proposed.root.locator('[data-authored-atomic="mention"]')
      ).toHaveAttribute('data-selected', 'true');
      const copied = await proposed.clipboard.copyNativeEventPayload();
      expect(copied.text).toBe('');
      expect(copied.fragment).toBeTruthy();
      const fragment = JSON.parse(
        decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
      );
      expect(fragment.slice.content[0].children).toContainEqual({
        type: 'mention',
        label: 'Alice',
        children: [{ text: '' }],
      });
      await page.keyboard.press(`Arrow${direction}`);
      await expect(
        proposed.root.locator('[data-authored-atomic="mention"]')
      ).toHaveAttribute('data-selected', 'false');
    }
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('!');
    await proposed.assert.modelBlockTexts(['AB!', '', 'CD']);
    expect(errors).toEqual([]);
  });

  test('retains an inline mention through native deletion, history and rejection', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('atomics');
    const mention = proposed.root.locator('[data-authored-atomic="mention"]');
    await expect(mention).toHaveText('@Alice');
    await proposed.selection.collapse({ path: [0, 2], offset: 0 });
    await page.keyboard.press('Backspace');
    await expect(mention).toHaveCount(0);
    await proposed.assert.modelBlockTexts(['AB', '', 'CD']);
    await expect(
      accepted.root.locator('[data-authored-atomic="mention"]')
    ).toHaveText('@Alice');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(mention).toHaveText('@Alice');
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect(mention).toHaveCount(0);
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(
      proposed.root.locator(
        '[data-editor-retained] [data-authored-atomic="mention"]'
      )
    ).toHaveText('@Alice');
    await expect(
      proposed.root.locator('[data-authored-atomic="media"]')
    ).toHaveText('Preview');
    await proposed.selection.collapse({ path: [0, 0], offset: 0 });
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+End');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('AB');
    expect(copied.fragment).toBeTruthy();
    const fragment = JSON.parse(
      decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
    );
    await info.attach('retained-mention-clipboard.json', {
      body: JSON.stringify(fragment, null, 2),
      contentType: 'application/json',
    });
    expect(fragment.slice.content).toHaveLength(1);
    expect(fragment.slice.content[0].children).toContainEqual({
      type: 'mention',
      label: 'Alice',
      children: [{ text: '' }],
    });
    await page.keyboard.type('X');
    await proposed.assert.modelBlockTexts(['AB', '', 'CD']);
    await expect(mention).toHaveText('@Alice');
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(mention).toHaveText('@Alice');
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveCount(
      0
    );
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 2], offset: 0 });
    await page.keyboard.type('!');
    await expect(proposed.root.locator('[data-editor-path="0,2"]')).toHaveText(
      '!B'
    );
    await proposed.assert.modelBlockTexts(['A!B', '', 'CD']);
    await expect(accepted.root.locator('[data-editor-path="0,2"]')).toHaveText(
      'B'
    );
    expect(errors).toEqual([]);
  });

  test('copies retained block media with native selection and preserves the following input', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('atomics');
    const media = proposed.root.locator('[data-authored-atomic="media"]');
    await media.click();
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 0 });
    await page.keyboard.press('ControlOrMeta+a');
    await expect(media).toHaveAttribute('data-selected', 'true');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('AB\n\nCD');
    expect(copied.fragment).toBeTruthy();
    const fragment = JSON.parse(
      decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
    );
    expect(fragment.slice.content).toHaveLength(3);
    expect(fragment.slice.content[1]).toEqual({
      type: 'media',
      label: 'Preview',
      children: [{ text: '' }],
    });
    await page.keyboard.type('X');
    await proposed.assert.modelBlockTexts(['AB', 'CD']);
    await expect(media).toHaveAttribute('data-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(media).toHaveAttribute('data-selected', 'false');
    await page.keyboard.type('!');
    await proposed.assert.modelBlockTexts(['AB', 'CD!']);
    await accepted.assert.modelBlockTexts(['AB', '', 'CD']);
    expect(errors).toEqual([]);
  });

  test('retains block media through native deletion, history and rejection', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop physical keyboard history proof'
    );

    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('atomics');
    const media = proposed.root.locator('[data-authored-atomic="media"]');
    await media.click();
    await page.keyboard.press('Backspace');
    await expect(media).toHaveCount(0);
    await proposed.assert.modelBlockTexts(['AB', 'CD']);
    await expect(
      accepted.root.locator('[data-authored-atomic="media"]')
    ).toHaveText('Preview');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(media).toHaveText('Preview');
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect(media).toHaveCount(0);
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(
      proposed.root.locator(
        '[data-editor-retained] [data-authored-atomic="media"]'
      )
    ).toHaveText('Preview');
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(media).toHaveText('Preview');
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveCount(
      0
    );
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await proposed.selection.collapse({ path: [2, 0], offset: 2 });
    await page.keyboard.type('!');
    await proposed.assert.modelBlockTexts(['AB', '', 'CD!']);
    await expect(accepted.root).toContainText('CD');
    expect(errors).toEqual([]);
  });

  for (const direction of ['backward', 'forward'] as const) {
    test(`keeps authored CodeMirror ${direction} navigation across its native boundary`, async ({
      page,
    }) => {
      const { accepted, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption('codemirror-boundaries');
      const input = proposed.root.locator('[data-code-block-codemirror-input]');
      const backward = direction === 'backward';
      await input.click();
      await page.keyboard.press(backward ? 'Home' : 'End');
      await page.keyboard.press(
        backward ? 'Shift+ArrowLeft' : 'Shift+ArrowRight'
      );
      await expect
        .poll(() => proposed.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: backward ? 0 : 2 },
          focus: { path: [backward ? 0 : 2, 0], offset: backward ? 2 : 0 },
        });
      await proposed.selection.collapse({
        path: [1, 0],
        offset: backward ? 0 : 2,
      });
      await proposed.focus();
      await expect(input).toBeFocused();
      await page.keyboard.press(backward ? 'ArrowLeft' : 'ArrowRight');
      await expect(proposed.root).toBeFocused();
      await expect
        .poll(() => proposed.selection.get())
        .toEqual({
          anchor: { path: [backward ? 0 : 2, 0], offset: backward ? 2 : 0 },
          focus: { path: [backward ? 0 : 2, 0], offset: backward ? 2 : 0 },
        });
      await page.keyboard.type('!');
      await proposed.assert.modelBlockTexts(
        backward ? ['EF!', 'AB', 'CD'] : ['EF', 'AB', '!CD']
      );
      await expect(accepted.root).toHaveText('EFABCD');
      expect(errors).toEqual([]);
    });
  }

  test('paints and copies an authored CodeMirror selection into the next paragraph', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { accepted, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('codemirror-boundaries');
    const input = proposed.root.locator('[data-code-block-codemirror-input]');
    await input.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('X');
    await expect(input).toHaveText('AXB');
    await proposed.assert.modelBlockTexts(['EF', 'AXB', 'CD']);
    await proposed.selection.select({
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [2, 0], offset: 1 },
    });
    await expect(input.locator('[data-code-block-model-selection]')).toHaveText(
      'XB'
    );
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('XB\nC');
    expect(copied.fragment).toBeTruthy();
    await proposed.selection.collapse({ path: [1, 0], offset: 2 });
    await proposed.focus();
    await expect(input).toBeFocused();
    await expect(
      input.locator('[data-code-block-model-selection]')
    ).toHaveCount(0);
    await page.keyboard.type('!');
    await expect(input).toHaveText('AX!B');
    await proposed.assert.modelBlockTexts(['EF', 'AX!B', 'CD']);
    await expect(accepted.root).toHaveText('EFABCD');
    expect(errors).toEqual([]);
  });

  test('reviews native CodeMirror input and clipboard through the shared authored boundary', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('codemirror');
    const input = proposed.root.locator('[data-code-block-codemirror-input]');
    const local = createBrowserEditorHarness(
      page,
      'authored-codemirror',
      input
    );
    await expect(input).toHaveText('AB');
    await input.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Shift+ArrowLeft');
    const copied = await local.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('B');
    const cut = await local.clipboard.cutNativeEventPayload();
    expect(cut.text).toBe('B');
    await expect(input).toHaveText('A');
    await proposed.assert.modelBlockTexts(['A']);
    await expect(accepted.root).toHaveText('AB');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(input).toHaveText('AB');
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect(input).toHaveText('A');
    await local.clipboard.pasteNativeText('X');
    await expect(input).toHaveText('AX');
    await page.keyboard.type('!');
    await expect(input).toHaveText('AX!');
    await proposed.assert.modelBlockTexts(['AX!']);
    await expect(accepted.root).toHaveText('AB');
    await controls
      .getByRole('button', { name: 'Edit accepted', exact: true })
      .click();
    await expect(input).toHaveText('AB');
    await expect(input).toBeFocused();
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(input).toHaveCount(0);
    await expect(proposed.root).toHaveText('AX!B');
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveText(
      'B'
    );
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(proposed.root).toHaveText('AB');
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await expect(input).toHaveText('AB');
    await input.click();
    await page.keyboard.press('End');
    await page.keyboard.type('?');
    await expect(input).toHaveText('AB?');
    await proposed.assert.modelBlockTexts(['AB?']);
    await expect(accepted.root).toHaveText('AB');
    expect(errors).toEqual([]);
  });

  test('cancels Chromium composition without a proposal and applies the deferred view', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== 'chromium',
      'Chromium composition protocol'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    const before = await proposed.root.textContent();
    const value = await proposed.get.modelValue();
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await startBrowserNativeEventTrace(proposed.root);
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'n',
      });
      await expect(proposed.root).toContainText('A nshared draft.');
      await controls
        .getByRole('button', { name: 'Edit accepted', exact: true })
        .click();
      await expect(
        controls.getByRole('button', { name: 'Suggest', exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 0,
        text: '',
      });
      await expect(
        controls.getByRole('button', { name: 'Edit accepted', exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(proposed.root).toHaveText(before!);
      await expect(accepted.root).toHaveText(before!);
      expect(await proposed.get.modelValue()).toEqual(value);
      await expect(
        page.getByText('No pending proposals.', { exact: true })
      ).toBeVisible();
      await controls
        .getByRole('button', { name: 'Suggest', exact: true })
        .click();
      await page.keyboard.type('!');
      await expect(proposed.root).toContainText('A !shared draft.');
      await page.keyboard.press('ControlOrMeta+z');
      await expect(proposed.root).toHaveText(before!);
      expect(errors).toEqual([]);
    } finally {
      const trace = await takeBrowserNativeEventTrace(proposed.root);
      await info.attach('chromium-authored-composition-cancel.json', {
        body: JSON.stringify(trace),
        contentType: 'application/json',
      });
      expect(trace.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'compositionend', data: '' }),
        ])
      );
      await client.detach();
    }
  });

  for (const finish of ['commit', 'cancel'] as const) {
    test(`keeps a Chromium composition replacement across paragraphs atomic on ${finish}`, async ({
      page,
    }, info) => {
      test.skip(
        info.project.name !== 'chromium',
        'Chromium composition protocol'
      );
      const { accepted, controls, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption('table-cell');
      const selection = {
        anchor: { path: [0, 0, 0, 0, 0], offset: 1 },
        focus: { path: [0, 0, 0, 1, 0], offset: 1 },
      };
      await proposed.selection.select(selection);
      const cell = proposed.root.locator('td').first();
      await startBrowserNativeEventTrace(proposed.root);
      const client = await page.context().newCDPSession(page);
      try {
        await client.send('Input.imeSetComposition', {
          selectionStart: 1,
          selectionEnd: 1,
          text: 'n',
        });
        await expect(cell).toHaveText('AnD');
        await expect(accepted.root.locator('td').first()).toHaveText('ABCD');
        if (finish === 'commit') {
          await client.send('Input.insertText', { text: 'に' });
        } else {
          await client.send('Input.imeSetComposition', {
            selectionStart: 0,
            selectionEnd: 0,
            text: '',
          });
        }
        await expect(cell).toHaveText(finish === 'commit' ? 'AにD' : 'AD');
        await expect(
          page
            .getByRole('region', { name: 'Pending proposals' })
            .getByRole('listitem')
        ).toHaveCount(1);
        const blocks = await proposed.get.modelBlockTexts();
        await controls
          .getByRole('button', { name: 'Undo', exact: true })
          .click();
        await expect(
          cell.locator(':scope > [data-editor-node="element"]')
        ).toHaveText(['AB', 'CD']);
        expect(await proposed.get.selection()).toEqual(selection);
        await controls
          .getByRole('button', { name: 'Redo', exact: true })
          .click();
        await expect(cell).toHaveText(finish === 'commit' ? 'AにD' : 'AD');
        await proposed.assert.modelBlockTexts(blocks);
        await expect(accepted.root.locator('td').first()).toHaveText('ABCD');
        await proposed.selection.collapse({ path: [0, 0, 0, 0, 0], offset: 1 });
        await page.keyboard.type('!');
        await expect(cell).toHaveText(finish === 'commit' ? 'A!にD' : 'A!D');
        expect(errors).toEqual([]);
      } finally {
        await info.attach(`chromium-expanded-composition-${finish}.json`, {
          body: JSON.stringify(
            await takeBrowserNativeEventTrace(proposed.root)
          ),
          contentType: 'application/json',
        });
        await client.detach();
      }
    });
  }

  test('refuses Chromium composition across retained text and preserves the next ordinary input', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== 'chromium',
      'Chromium composition protocol'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.select({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 8 },
    });
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveText(
      'shared'
    );
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    const before = await proposed.root.textContent();
    const valueBefore = await proposed.get.modelValue();
    const selectionBefore = await proposed.get.selection();
    const blocksBefore = await proposed.get.modelBlockTexts();
    const selectedText = () =>
      proposed.root
        .locator('[data-editor-view-selection]')
        .allTextContents()
        .then((parts) => parts.join(''));
    await expect.poll(selectedText).toBe(' shared ');
    const assertRefused = async () => {
      await expect(proposed.root).toHaveText(before!);
      await expect.poll(selectedText).toBe(' shared ');
      expect(await proposed.get.modelValue()).toEqual(valueBefore);
      expect(await proposed.get.selection()).toEqual(selectionBefore);
      await proposed.assert.modelBlockTexts(blocksBefore);
      await expect(accepted.root).toHaveText(before!);
    };
    await startBrowserNativeEventTrace(proposed.root);
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'n',
      });
      await assertRefused();
      await client.send('Input.insertText', { text: 'に' });
      await assertRefused();
      await proposed.selection.collapse({ path: [0, 0], offset: 0 });
      await page.keyboard.type('!');
      await expect(proposed.root).toContainText('!A shared draft.');
      await proposed.assert.modelBlockTexts(['!A  draft.', blocksBefore[1]]);
      await page.keyboard.press('ControlOrMeta+z');
      await expect(proposed.root).toHaveText(before!);
      await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
      await expect(proposed.root).toContainText('!A shared draft.');
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(proposed.root).toHaveText(before!);
      expect(errors).toEqual([]);
    } finally {
      const trace = await takeBrowserNativeEventTrace(proposed.root);
      await info.attach('chromium-retained-composition-refusal.json', {
        body: JSON.stringify(trace),
        contentType: 'application/json',
      });
      expect(trace.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'compositionstart' }),
          expect.objectContaining({
            type: 'input',
            inputType: 'insertCompositionText',
            data: 'n',
          }),
          expect.objectContaining({ type: 'beforeinput', data: 'に' }),
        ])
      );
      await client.detach();
    }
  });

  test('reviews native external textarea cut and paste through shared history', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('external-text');
    const input = page.getByRole('textbox', {
      name: 'Proposed document text',
      exact: true,
    });
    const local = createBrowserEditorHarness(
      page,
      'authored-external-clipboard',
      input
    );
    await input.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Shift+ArrowLeft');
    const copy = await local.clipboard.copyNativeEventPayload();
    expect(copy.text).toBe('B');
    const cut = await local.clipboard.cutNativeEventPayload();
    expect(cut.text).toBe('B');
    await expect(input).toHaveValue('A');
    await expect(accepted.root).toHaveText('AB');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(input).toHaveValue('AB');
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect(input).toHaveValue('A');
    await local.clipboard.pasteNativeText('X');
    await expect(input).toHaveValue('AX');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(input).toHaveValue('A');
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect(input).toHaveValue('AX');
    await expect(accepted.root).toHaveText('AB');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(proposed.root).toHaveText('AXB');
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveText(
      'B'
    );
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(proposed.root).toHaveText('AB');
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await info.attach('external-clipboard-rejection.json', {
      body: JSON.stringify({
        dom: await proposed.root.innerHTML(),
        value: await proposed.get.modelValue(),
        errors,
      }),
      contentType: 'application/json',
    });
    await expect(input).toHaveValue('AB');
    expect(errors).toEqual([]);
  });

  for (const adapter of ['textarea', 'CodeMirror'] as const) {
    test(`captures an external ${adapter} composition and keeps review and history coherent`, async ({
      page,
    }, info) => {
      test.skip(
        info.project.name !== 'chromium',
        'Chromium composition protocol'
      );
      const { accepted, controls, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption(adapter === 'textarea' ? 'external-text' : 'codemirror');
      const input = page.getByRole('textbox', {
        name:
          adapter === 'textarea'
            ? 'Proposed document text'
            : 'Proposed document code',
        exact: true,
      });
      const expectText = async (text: string) => {
        if (adapter === 'CodeMirror') await expect(input).toHaveText(text);
        else await expect(input).toHaveValue(text);
      };
      await expectText('AB');
      await input.click();
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowRight');
      await startBrowserNativeEventTrace(proposed.root);
      const client = await page.context().newCDPSession(page);
      try {
        await client.send('Input.imeSetComposition', {
          selectionStart: 1,
          selectionEnd: 1,
          text: 'a',
        });
        await expectText('AaB');
        await controls
          .getByRole('button', { name: 'Edit accepted', exact: true })
          .click();
        await expect(
          controls.getByRole('button', { name: 'Suggest', exact: true })
        ).toHaveAttribute('aria-pressed', 'true');
        await client.send('Input.imeSetComposition', {
          selectionStart: 1,
          selectionEnd: 1,
          text: 'あ',
        });
        await client.send('Input.insertText', { text: 'あ' });
        await expectText('AB');
        await expect(accepted.root).toHaveText('AB');
        await controls
          .getByRole('button', { name: 'Suggest', exact: true })
          .click();
        await expectText('AあB');
        await info.attach('external-composition-focus.json', {
          body: JSON.stringify({
            focus: await proposed.get.focusOwner(),
            selection: await proposed.get.selection(),
            active: await page.evaluate(() => ({
              tag: document.activeElement?.tagName,
              role: document.activeElement?.getAttribute('role'),
              label: document.activeElement?.getAttribute('aria-label'),
            })),
            errors,
          }),
          contentType: 'application/json',
        });
        await expect(input).toBeFocused();
        await page.keyboard.type('!');
        await expectText('Aあ!B');
        for (const text of ['AあB', 'AB']) {
          await page.keyboard.press('ControlOrMeta+z');
          await expectText(text);
        }
        for (const text of ['AあB', 'Aあ!B']) {
          await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
          await expectText(text);
        }
        await page
          .getByRole('button', { name: 'Accept all Alice', exact: true })
          .click();
        await expect(accepted.root).toHaveText('Aあ!B');
        await input.click();
        await page.keyboard.press('Home');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Shift+ArrowRight');
        await page.keyboard.press('Backspace');
        await expectText('A!B');
        await controls
          .getByRole('button', { name: 'Show changes', exact: true })
          .click();
        await expect(proposed.root).toHaveText('Aあ!B');
        await expect(
          proposed.root.locator('[data-editor-retained]')
        ).toHaveText('あ');
        await controls
          .getByRole('button', { name: 'Suggest', exact: true })
          .click();
        await expectText('A!B');
        await page
          .getByRole('button', { name: 'Reject all Alice', exact: true })
          .click();
        await expectText('Aあ!B');
        expect(errors).toEqual([]);
      } finally {
        await info.attach('chromium-external-authored-composition.json', {
          body: JSON.stringify(
            await takeBrowserNativeEventTrace(proposed.root)
          ),
          contentType: 'application/json',
        });
        await client.detach();
      }
    });
  }

  test('defers a view switch until Chromium composition commits and preserves history', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== 'chromium',
      'Chromium composition protocol'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('two-quotes');
    await proposed.selection.collapse({ path: [1, 0, 0], offset: 2 });
    await startBrowserNativeEventTrace(proposed.root);
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'n',
      });
      await expect(proposed.root).toHaveText('ABCDn');
      await controls
        .getByRole('button', { name: 'Edit accepted', exact: true })
        .click();
      await expect(
        controls.getByRole('button', { name: 'Suggest', exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'に',
      });
      await client.send('Input.insertText', { text: 'に' });
      await expect(proposed.root).toHaveText('ABCD');
      await expect(accepted.root).toHaveText('ABCD');
      await controls
        .getByRole('button', { name: 'Suggest', exact: true })
        .click();
      await expect(proposed.root).toHaveText('ABCDに');
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      await expect(proposed.root).toHaveText('ABCD');
      await controls.getByRole('button', { name: 'Redo', exact: true }).click();
      await expect(proposed.root).toHaveText('ABCDに');
      await page.keyboard.type('!');
      await expect(proposed.root).toHaveText('ABCDに!');
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(proposed.root).toHaveText('ABCD');
      expect(errors).toEqual([]);
    } finally {
      await info.attach('chromium-authored-composition.json', {
        body: JSON.stringify(await takeBrowserNativeEventTrace(proposed.root)),
        contentType: 'application/json',
      });
      await client.detach();
    }
  });

  test('composes ordinary text beside a retained paragraph through Chromium input', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== 'chromium',
      'Chromium composition protocol'
    );
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('table-cell');
    const first = [0, 0, 0, 0, 0];
    await proposed.selection.select({
      anchor: { path: first, offset: 1 },
      focus: { path: [0, 0, 0, 1, 0], offset: 1 },
    });
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: first, offset: 2 });
    await proposed.assert.domCaret({ text: 'D', offset: 1 });
    await startBrowserNativeEventTrace(proposed.root);
    const blocks = proposed.root
      .locator('td')
      .first()
      .locator(':scope > [data-editor-node="element"]');
    const client = await page.context().newCDPSession(page);
    try {
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'n',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'に',
      });
      await client.send('Input.insertText', { text: 'に' });
      await expect(blocks).toHaveText(['AB', 'CDに']);
      await expect(accepted.root.locator('td').first()).toHaveText('ABCD');
      await page.keyboard.type('!');
      await expect(blocks).toHaveText(['AB', 'CDに!']);
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      await expect(blocks).toHaveText(['AB', 'CDに']);
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      await expect(blocks).toHaveText(['AB', 'CD']);
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(blocks).toHaveText(['AB', 'CD']);
      expect(errors).toEqual([]);
    } finally {
      await info.attach('chromium-retained-composition.json', {
        body: JSON.stringify(await takeBrowserNativeEventTrace(proposed.root)),
        contentType: 'application/json',
      });
      await client.detach();
    }
  });

  for (const side of ['prefix', 'suffix'] as const) {
    test(`preserves a link through native ${side} deletion and typing`, async ({
      page,
    }) => {
      const { accepted, controls, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption('link');
      const middle = { path: [0, 1, 0], offset: 1 };
      await proposed.selection.select(
        side === 'prefix'
          ? { anchor: { path: [0, 0], offset: 1 }, focus: middle }
          : { anchor: middle, focus: { path: [0, 2], offset: 1 } }
      );
      await page.keyboard.press('Backspace');
      await proposed.assert.modelBlockTexts([side === 'prefix' ? 'ACD' : 'AB']);
      await controls
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
      const link = proposed.root.locator('a');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', '/docs');
      await expect
        .poll(() =>
          link.evaluate((node) => node.textContent?.replaceAll('\uFEFF', ''))
        )
        .toBe('BC');
      await proposed.selection.collapse(middle);
      await proposed.assert.domCaret({
        text: side === 'prefix' ? 'C' : 'B',
        offset: 1,
      });
      await page.keyboard.type('!');
      await expect
        .poll(() =>
          link.evaluate((node) => node.textContent?.replaceAll('\uFEFF', ''))
        )
        .toBe(side === 'prefix' ? 'BC!' : 'B!C');
      await expect(accepted.root).toHaveText('ABCD');
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(link).toHaveText('BC');
      await proposed.assert.modelBlockTexts(['ABCD']);
      expect(errors).toEqual([]);
    });
  }
  test('replaces ordinary text beside a retained paragraph and preserves undo', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('table-cell');
    const blocks = proposed.root
      .locator('td')
      .first()
      .locator(':scope > [data-editor-node="element"]');
    const first = [0, 0, 0, 0, 0];
    const second = [0, 0, 0, 1, 0];
    await proposed.selection.select({
      anchor: { path: first, offset: 1 },
      focus: { path: second, offset: 1 },
    });
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(blocks).toHaveText(['AB', 'CD']);
    await proposed.selection.collapse({ path: first, offset: 2 });
    await proposed.assert.domCaret({ text: 'D', offset: 1 });
    await page.keyboard.press('Shift+ArrowLeft');
    const capture = async (stage: string) =>
      test.info().attach(`${stage}.json`, {
        body: JSON.stringify(
          {
            errors,
            model: await proposed.get.modelValue(),
            lastCommit: await proposed.get.lastCommit(),
            selection: await proposed.get.selection(),
            dom: await proposed.get.html(),
            focus: await proposed.get.focusOwner(),
            input: await proposed.root.evaluate((root) => {
              const handle = (
                root as HTMLElement & {
                  __pliteBrowserHandle?: {
                    getInputState: () => unknown;
                    getKernelTrace: () => unknown;
                    getViewSelection: () => unknown;
                  };
                }
              ).__pliteBrowserHandle;
              return {
                state: handle?.getInputState(),
                trace: handle?.getKernelTrace(),
                viewSelection: handle?.getViewSelection(),
              };
            }),
          },
          null,
          2
        ),
        contentType: 'application/json',
      });
    await capture('replacement-native-selection');
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('D');
    await page.keyboard.press('Shift+ArrowLeft');
    await expect
      .poll(async () => {
        const selectionText = await proposed.root
          .locator('[data-editor-view-selection]')
          .allTextContents();
        return selectionText.join('');
      })
      .toBe('CD');
    await page.keyboard.press('Shift+ArrowRight');
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('D');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('D');
    await page.keyboard.type('X');
    await capture('replacement-native-input');
    await expect(blocks).toHaveText(['AB', 'CDX']);
    await expect(accepted.root.locator('td').first()).toHaveText('ABCD');
    for (let cycle = 0; cycle < 2; cycle += 1) {
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      await expect(blocks).toHaveText(['AB', 'CD']);
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe('D');
      await controls.getByRole('button', { name: 'Redo', exact: true }).click();
      await expect(blocks).toHaveText(['AB', 'CDX']);
    }
    await page.keyboard.type('!');
    await expect(blocks).toHaveText(['AB', 'CDX!']);
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(blocks).toHaveText(['AB', 'CD']);
    expect(errors).toEqual([]);
  });
  for (const sample of ['table-cell', 'named-root'] as const) {
    test(`keeps retained structure and native input inside ${sample}`, async ({
      page,
    }) => {
      const { accepted, controls, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption(sample);
      const table = sample === 'table-cell';
      const first = table ? [0, 0, 0, 0, 0] : [0, 0, 0];
      const second = table ? [0, 0, 0, 1, 0] : [1, 0, 0];
      const content = table
        ? proposed.root.locator('td').first()
        : proposed.root;
      const acceptedContent = table
        ? accepted.root.locator('td').first()
        : accepted.root;
      const blocks = content.locator(':scope > [data-editor-node="element"]');
      await expect(blocks).toHaveText(['AB', 'CD']);
      await proposed.selection.select({
        anchor: { path: first, offset: 1 },
        focus: { path: second, offset: 1 },
      });
      await page.keyboard.press('Backspace');
      await controls
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
      await expect(blocks).toHaveText(table ? ['AB', 'CD'] : ['ABD', 'CD']);
      await proposed.selection.collapse({ path: first, offset: 2 });
      await proposed.assert.domCaret({ text: 'D', offset: 1 });
      await page.keyboard.type('!');
      await expect(blocks).toHaveText(table ? ['AB', 'CD!'] : ['ABD!', 'CD']);
      await expect(acceptedContent).toHaveText('ABCD');
      if (table) {
        await expect(
          proposed.root.locator('table > tbody > tr > td')
        ).toHaveCount(2);
        await expect(proposed.root.locator('td').nth(1)).toHaveText(
          'Other cell'
        );
      } else {
        const document = await proposed.get.modelValue();
        expect(document.children).toEqual([
          { type: 'paragraph', children: [{ text: 'Main document' }] },
        ]);
      }
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(blocks).toHaveText(['AB', 'CD']);
      await expect(proposed.root.locator('[data-editor-retained]')).toHaveCount(
        0
      );
      await proposed.selection.collapse({ path: second, offset: 1 });
      await page.keyboard.type('?');
      await expect(blocks).toHaveText(['AB', 'C?D']);
      await expect(acceptedContent).toHaveText('ABCD');
      expect(errors).toEqual([]);
    });
  }
  test('moves to document edges and extends the selection with native shortcuts', async ({
    page,
  }) => {
    const { accepted, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('two-quotes');
    await proposed.selection.collapse({ path: [1, 0, 0], offset: 2 });
    await page.keyboard.press('Control+Home');
    await proposed.assert.domCaret({ text: 'AB', offset: 0 });
    await page.keyboard.press('Control+Shift+End');
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window.getSelection()?.toString() ?? '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .join('\n')
        )
      )
      .toBe('AB\nCD');
    await page.keyboard.press('ArrowRight');
    await proposed.assert.domCaret({ text: 'CD', offset: 2 });
    await page.keyboard.type('!');
    await expect(proposed.root).toHaveText('ABCD!');
    await expect(accepted.root).toHaveText('ABCD');
    expect(errors).toEqual([]);
  });
  for (const sample of [
    'quote-suffix',
    'quote-prefix',
    'two-quotes',
  ] as const) {
    test(`retains native quote structure, caret and rejection for ${sample}`, async ({
      page,
    }) => {
      const { accepted, controls, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption(sample);
      await proposed.assert.modelBlockTexts(['AB', 'CD']);
      const first = sample === 'quote-suffix' ? [0, 0] : [0, 0, 0];
      const second = sample === 'quote-prefix' ? [1, 0] : [1, 0, 0];
      await proposed.selection.select({
        anchor: { path: first, offset: 1 },
        focus: { path: second, offset: 1 },
      });
      await page.keyboard.press('Backspace');
      await controls
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
      const blocks = proposed.root.locator(
        ':scope > [data-editor-node="element"]'
      );
      await expect(blocks).toHaveText(['ABD', 'CD']);
      await expect(proposed.root.locator('blockquote')).toHaveCount(
        sample === 'two-quotes' ? 2 : 1
      );
      await expect(
        accepted.root.locator(':scope > [data-editor-node="element"]')
      ).toHaveText(['AB', 'CD']);
      await proposed.selection.collapse({ path: first, offset: 2 });
      await proposed.assert.domCaret({ text: 'D', offset: 1 });
      await page.keyboard.type('!');
      await test.info().attach('quote-native-input.json', {
        body: JSON.stringify(
          {
            errors,
            model: await proposed.get.modelValue(),
            selection: await proposed.get.selection(),
            dom: await proposed.get.html(),
            focus: await proposed.get.focusOwner(),
            lastCommit: await proposed.get.lastCommit(),
            input: await proposed.root.evaluate((root) => {
              const handle = (
                root as HTMLElement & {
                  __pliteBrowserHandle?: {
                    getInputState: () => unknown;
                    getKernelTrace: () => unknown;
                    getViewSelection: () => unknown;
                  };
                }
              ).__pliteBrowserHandle;
              return {
                state: handle?.getInputState(),
                trace: handle?.getKernelTrace(),
                viewSelection: handle?.getViewSelection(),
              };
            }),
          },
          null,
          2
        ),
        contentType: 'application/json',
      });
      await expect(blocks).toHaveText(['ABD!', 'CD']);
      await page.screenshot({
        path: test.info().outputPath(`retained-${sample}.png`),
      });
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(blocks).toHaveText(['AB', 'CD']);
      await expect(proposed.root.locator('[data-editor-retained]')).toHaveCount(
        0
      );
      await proposed.selection.collapse({ path: second, offset: 1 });
      await page.keyboard.type('?');
      await expect(blocks).toHaveText(['AB', 'C?D']);
      await expect(
        accepted.root.locator(':scope > [data-editor-node="element"]')
      ).toHaveText(['AB', 'CD']);
      expect(errors).toEqual([]);
    });
  }

  test('retains paragraph boundaries through native range deletion, selection and rejection', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    const paragraphs = [
      'A shared draft.',
      'Select a phrase, type a replacement, and review the result.',
    ];
    await proposed.selection.select({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 6 },
    });
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    const blocks = proposed.root.locator('[data-editor-node="element"]');
    await expect(blocks).toHaveText(paragraphs);
    await expect(
      accepted.root.locator('[data-editor-node="element"]')
    ).toHaveText(paragraphs);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 20; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await expect
      .poll(() =>
        proposed.root
          .locator('[data-editor-view-selection]')
          .allTextContents()
          .then((parts) => parts.join(''))
      )
      .toBe('shared draft.Select');
    await proposed.assert.noDoubleSelectionHighlight();
    await page.screenshot({
      path: test.info().outputPath('retained-paragraph-selection.png'),
    });
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await test.info().attach('structural-review-state.json', {
      body: JSON.stringify(
        {
          errors,
          accepted: await accepted.get.modelValue(),
          proposed: await proposed.get.modelValue(),
          selection: await proposed.get.selection(),
          dom: await proposed.get.html(),
        },
        null,
        2
      ),
      contentType: 'application/json',
    });
    await expect(blocks).toHaveText(paragraphs);
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveCount(
      0
    );
    await proposed.selection.collapse({ path: [1, 0], offset: 6 });
    await page.keyboard.type('!');
    await expect(blocks.nth(1)).toHaveText(
      'Select! a phrase, type a replacement, and review the result.'
    );
    await expect(
      accepted.root.locator('[data-editor-node="element"]')
    ).toHaveText(paragraphs);
    expect(errors).toEqual([]);
  });

  for (const modifier of ['held', 'released'] as const) {
    test(`preserves the vertical column across short wrapped lines with Shift ${modifier}`, async ({
      page,
    }) => {
      const { accepted, controls, errors, proposed } = await openReview(page);
      await proposed.selection.collapse({ path: [0, 0], offset: 2 });
      for (let index = 0; index < 6; index++) {
        await page.keyboard.press('Shift+ArrowRight');
      }
      await page.keyboard.press('Backspace');
      await controls
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
      await proposed.root.evaluate((root) => {
        Object.assign((root as HTMLElement).style, {
          width: '12ch',
          maxWidth: 'none',
          boxSizing: 'content-box',
          padding: '0',
          border: '0',
          fontFamily: 'monospace',
          fontSize: '20px',
          lineHeight: '30px',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
        });
      });
      const focus = () =>
        proposed.root.evaluate((root) => {
          const handle = (
            root as HTMLElement & {
              __pliteBrowserHandle?: {
                getSelection: () => {
                  focus: { path: number[]; offset: number };
                };
                getViewSelection: () => {
                  focus: {
                    fragmentId?: string;
                    point: { path: number[]; offset: number };
                  };
                } | null;
              };
            }
          ).__pliteBrowserHandle;
          if (!handle) throw new Error('Missing selection handle');
          const projected = handle.getViewSelection()?.focus;
          return {
            fragmentId: projected?.fragmentId ?? null,
            point: projected?.point ?? handle.getSelection().focus,
          };
        });
      await proposed.selection.collapse({ path: [1, 0], offset: 5 });
      const start = await focus();
      const move = (key: 'ArrowDown' | 'ArrowUp') =>
        page.keyboard.press(modifier === 'held' ? key : `Shift+${key}`);
      if (modifier === 'held') await page.keyboard.down('Shift');
      await move('ArrowUp');
      const middle = await focus();
      await move('ArrowUp');
      await expect
        .poll(() =>
          proposed.root
            .locator('[data-editor-view-selection]')
            .allTextContents()
            .then((parts) => parts.join(''))
        )
        .toBe('red draft.Selec');
      await proposed.assert.noDoubleSelectionHighlight();
      await move('ArrowDown');
      await expect.poll(focus).toEqual(middle);
      await move('ArrowDown');
      await expect.poll(focus).toEqual(start);
      if (modifier === 'held') await page.keyboard.up('Shift');
      await proposed.selection.collapse({ path: [1, 0], offset: 5 });
      await proposed.root.evaluate((root) => {
        const traceRoot = root as HTMLElement & {
          __verticalTrace?: unknown[];
          __pliteBrowserHandle?: {
            getSelection: () => unknown;
            getViewSelection: () => unknown;
          };
        };
        traceRoot.__verticalTrace = [];
        for (const type of ['keydown', 'keyup', 'selectionchange']) {
          document.addEventListener(type, (event) => {
            const selection = window.getSelection();
            traceRoot.__verticalTrace?.push({
              type: event.type,
              key: event instanceof KeyboardEvent ? event.key : null,
              model: traceRoot.__pliteBrowserHandle?.getSelection(),
              view: traceRoot.__pliteBrowserHandle?.getViewSelection(),
              native: {
                text: selection?.focusNode?.textContent,
                offset: selection?.focusOffset,
              },
            });
          });
        }
      });
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      await test.info().attach('vertical-transitions.json', {
        body: JSON.stringify(
          await proposed.root.evaluate(
            (root) =>
              (root as HTMLElement & { __verticalTrace?: unknown[] })
                .__verticalTrace
          ),
          null,
          2
        ),
        contentType: 'application/json',
      });
      await expect.poll(focus).toMatchObject({
        point: { path: [0, 0], offset: 3 },
      });
      const retainedFocus = await focus();
      expect(retainedFocus.fragmentId).not.toBeNull();
      await page.screenshot({
        path: test.info().outputPath('wrapped-retained-caret.png'),
      });
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect.poll(focus).toEqual(start);
      await page.keyboard.type('!');
      await expect(proposed.root).toContainText('Selec!t a phrase');
      await expect(accepted.root).toContainText('Select a phrase');
      expect(errors).toEqual([]);
    });
  }

  test('moves vertically into retained text and reverses the native selection path', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.root.evaluate((root) => {
      Object.assign((root as HTMLElement).style, {
        width: '900px',
        maxWidth: 'none',
        fontFamily: 'monospace',
        fontSize: '20px',
        lineHeight: '30px',
      });
    });
    await proposed.selection.collapse({ path: [1, 0], offset: 5 });
    await page.keyboard.press('Shift+ArrowUp');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('red draft.\nSelec');
    await proposed.assert.noDoubleSelectionHighlight();
    await page.keyboard.press('Shift+ArrowDown');
    await expect(
      proposed.root.locator('[data-editor-view-selection]')
    ).toHaveCount(0);
    await proposed.selection.collapse({ path: [1, 0], offset: 5 });
    await page.keyboard.press('ArrowUp');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const selection = window.getSelection();
          return {
            text: selection?.focusNode?.textContent,
            offset: selection?.focusOffset,
            retained: !!selection?.focusNode?.parentElement?.closest(
              '[data-editor-retained]'
            ),
          };
        })
      )
      .toEqual({ text: 'shared', offset: 3, retained: true });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('Selec!t a phrase');
    await expect(accepted.root).toContainText('Select a phrase');
    expect(errors).toEqual([]);
  });

  test('extends to visual line edges across retained content with Home and End', async ({
    page,
  }) => {
    const { controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    await page.keyboard.press('Shift+End');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(' shared draft.');
    await page.keyboard.press('Home');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('!A shared draft.');
    expect(errors).toEqual([]);
  });

  test('selects all visible markup and protects retained text during replacement', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    await page.keyboard.press(
      `${process.platform === 'darwin' ? 'Meta' : 'Control'}+a`
    );
    await expect(
      proposed.root.locator(
        '[data-editor-retained] [data-editor-view-selection]'
      )
    ).toHaveText('shared');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(
      'A shared draft.\nSelect a phrase, type a replacement, and review the result.'
    );
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    expect(errors).toEqual([]);
  });

  for (const side of ['before', 'after'] as const) {
    test(`collapses ${side} retained text and preserves native typing through review and history`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name === 'mobile',
        'Desktop native caret and physical keyboard proof'
      );

      const { accepted, controls, errors, proposed } = await openReview(page);
      await proposed.selection.collapse({ path: [0, 0], offset: 2 });
      for (let index = 0; index < 6; index++) {
        await page.keyboard.press('Shift+ArrowRight');
      }
      await page.keyboard.press('Backspace');
      await controls
        .getByRole('button', { name: 'Show changes', exact: true })
        .click();
      await page.getByRole('combobox', { name: 'Author' }).selectOption('bob');
      await proposed.selection.collapse({ path: [0, 0], offset: 2 });
      for (let index = 0; index < 6; index++) {
        await page.keyboard.press('Shift+ArrowRight');
      }
      await page.keyboard.press(side === 'after' ? 'ArrowRight' : 'ArrowLeft');
      await expect
        .poll(() =>
          page.evaluate(() => {
            const selection = window.getSelection();
            return {
              text: selection?.focusNode?.textContent,
              offset: selection?.focusOffset,
              collapsed: selection?.isCollapsed,
              retained: !!selection?.focusNode?.parentElement?.closest(
                '[data-editor-retained]'
              ),
            };
          })
        )
        .toEqual({
          text: side === 'after' ? ' draft.' : 'A ',
          offset: side === 'after' ? 0 : 2,
          collapsed: true,
          retained: false,
        });
      const expected =
        side === 'after' ? 'A shared!? draft.' : 'A !?shared draft.';
      await page.keyboard.type('!?');
      await expect(proposed.root).toContainText(expected);
      await expect(accepted.root).toContainText('A shared draft.');
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      await expect(proposed.root).toContainText('A shared draft.');
      await controls.getByRole('button', { name: 'Redo', exact: true }).click();
      await expect(proposed.root).toContainText(expected);
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(proposed.root).toContainText(expected);
      await expect(proposed.root.locator('[data-editor-retained]')).toHaveCount(
        0
      );
      await page
        .getByRole('button', { name: 'Accept all Bob', exact: true })
        .click();
      await expect(accepted.root).toContainText(expected);
      expect(errors).toEqual([]);
    });
  }

  test('maps native retained selection through another view edit and restores the deletion', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await accepted.root.evaluate((root) => {
      const handle = (
        root as HTMLElement & {
          __pliteBrowserHandle?: {
            insertTextAt: (
              text: string,
              at: { path: number[]; offset: number }
            ) => void;
          };
        }
      ).__pliteBrowserHandle;
      if (!handle) throw new Error('Missing accepted-view edit handle');
      handle.insertTextAt('P ', { path: [0, 0], offset: 0 });
      handle.insertTextAt('X', { path: [0, 0], offset: 7 });
    });
    const selectedText = () =>
      proposed.root
        .locator('[data-editor-view-selection]')
        .allTextContents()
        .then((parts) => parts.join(''));
    await expect.poll(selectedText).toBe('shaXred');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('shaXred');
    await page.keyboard.press('Shift+ArrowRight');
    await expect.poll(selectedText).toBe('shaXred ');
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveCount(
      0
    );
    await expect(
      proposed.root.locator('[data-editor-view-selection]')
    ).toHaveCount(0);
    await expect(proposed.root).toContainText('P A shaXred draft.');
    await expect(accepted.root).toContainText('P A shaXred draft.');
    expect(errors).toEqual([]);
  });

  test('uses native word shortcuts across retained text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop physical keyboard shortcut proof'
    );

    const { controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    const modifier = process.platform === 'darwin' ? 'Alt' : 'Control';
    const selectedText = () =>
      proposed.root
        .locator('[data-editor-view-selection]')
        .allTextContents()
        .then((parts) => parts.join(''));
    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);
    await expect.poll(selectedText).toBe(' shared');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(' shared');
    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);
    await expect.poll(selectedText).toBe(' shared draft');
    await page.keyboard.press(`${modifier}+Shift+ArrowLeft`);
    await expect.poll(selectedText).toBe(' shared ');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A shared draft.');
    expect(errors).toEqual([]);
  });

  test('advances retained selection in both directions after each native input settles', async ({
    page,
  }) => {
    const { controls, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    const selectedText = () =>
      proposed.root.evaluate((root) => {
        const highlights = root.querySelectorAll(
          '[data-editor-view-selection]'
        );
        if (highlights.length) {
          return [...highlights].map((node) => node.textContent).join('');
        }
        const selection = root.ownerDocument.getSelection();
        return selection &&
          root.contains(selection.anchorNode) &&
          root.contains(selection.focusNode)
          ? selection.toString()
          : '';
      });
    for (const selected of [
      ' ',
      ' s',
      ' sh',
      ' sha',
      ' shar',
      ' share',
      ' shared',
      ' shared ',
    ]) {
      await page.keyboard.press('Shift+ArrowRight');
      await expect.poll(selectedText).toBe(selected);
    }
    for (const selected of [
      ' shared',
      ' share',
      ' shar',
      ' sha',
      ' sh',
      ' s',
      ' ',
      '',
    ]) {
      await page.keyboard.press('Shift+ArrowLeft');
      await expect.poll(selectedText).toBe(selected);
    }
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A !shared draft.');
  });

  test('selects retained text through native arrows, copies it and refuses ordinary input', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A  draft.');
    await controls
      .getByRole('button', { name: 'Show changes', exact: true })
      .click();
    await expect(proposed.root.locator('[data-editor-retained]')).toHaveText(
      'shared'
    );
    await expect(proposed.root).toContainText('A shared draft.');
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    if (process.env.PLITE_AUTHORED_SELECTION_TRACE) {
      await proposed.root.evaluate((root) => {
        const entries: unknown[] = [];
        const traceRoot = root as HTMLElement & {
          __authoredSelectionTrace?: unknown[];
          __pliteBrowserHandle?: {
            getSelection?: () => unknown;
            getViewSelection?: () => unknown;
          };
        };
        traceRoot.__authoredSelectionTrace = entries;
        const capture = (event: Event, phase: string) => {
          const selection = window.getSelection();
          const view = traceRoot.__pliteBrowserHandle?.getViewSelection?.();
          entries.push({
            phase,
            event: event.type,
            key: event instanceof KeyboardEvent ? event.key : null,
            prevented: event.defaultPrevented,
            native: {
              anchor: selection?.anchorOffset,
              anchorText: selection?.anchorNode?.textContent,
              focus: selection?.focusOffset,
              focusText: selection?.focusNode?.textContent,
              text: selection?.toString(),
            },
            model: traceRoot.__pliteBrowserHandle?.getSelection?.(),
            view,
            active: document.activeElement?.getAttribute('aria-label'),
          });
        };
        for (const type of ['keydown', 'keyup', 'selectionchange']) {
          document.addEventListener(
            type,
            (event) => capture(event, 'capture'),
            true
          );
          document.addEventListener(type, (event) => capture(event, 'bubble'));
        }
      });
    }
    for (let index = 0; index < 8; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    if (process.env.PLITE_AUTHORED_SELECTION_TRACE) {
      const trace = await proposed.root.evaluate(
        (root) =>
          (root as HTMLElement & { __authoredSelectionTrace?: unknown[] })
            .__authoredSelectionTrace
      );
      await test.info().attach('selection-events.json', {
        body: JSON.stringify(trace, null, 2),
        contentType: 'application/json',
      });
    }
    await expect(
      proposed.root.locator(
        '[data-editor-retained] [data-editor-view-selection]'
      )
    ).toHaveText('shared');
    await expect(
      accepted.root.locator('[data-editor-view-selection]')
    ).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('');
    await proposed.assert.noDoubleSelectionHighlight();
    await page.screenshot({
      path: test.info().outputPath('markup-selection.png'),
    });
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(' shared ');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(
      proposed.root.locator(
        '[data-editor-retained] [data-editor-view-selection]'
      )
    ).toHaveText('shared');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(
      proposed.root.locator(
        '[data-editor-retained] [data-editor-view-selection]'
      )
    ).toHaveText('shared');
    await proposed.clipboard.pasteNativeText('replacement');
    await expect(proposed.root).toContainText('A shared draft.');
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await expect(proposed.root).toContainText('A  draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    expect(errors).toEqual([]);
  });
  test('copies and cuts proposed text and pastes through native clipboard events', async ({
    page,
  }) => {
    const { accepted, errors, independent, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    for (let index = 0; index < 7; index++) {
      await page.keyboard.press('Shift+ArrowLeft');
    }
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('better ');
    const cut = await proposed.clipboard.cutNativeEventPayload();
    expect(cut.text).toBe('better ');
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await independent.selection.collapse({ path: [0, 0], offset: 19 });
    await independent.assert.domCaret({
      offset: 19,
      text: 'A separate document.',
    });
    await independent.clipboard.pasteNativeText(copied.text);
    await expect(independent.root).toHaveText('A separate documentbetter .');
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await proposed.clipboard.pasteNativeText('fresh ');
    await expect(proposed.root).toContainText('A fresh shared draft.');
    await expect(accepted.root).not.toContainText('fresh');
    expect(errors).toEqual([]);
  });

  test('deletes complete graphemes in proposed content and keeps accepted text intact', async ({
    page,
  }) => {
    const { accepted, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.insertText('👩🏽‍💻e\u0301🙂');
    await expect(proposed.root).toContainText('A 👩🏽‍💻e\u0301🙂shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A 👩🏽‍💻e\u0301shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A 👩🏽‍💻shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A shared draft.');
    await page.keyboard.type('ready ');
    await expect(proposed.root).toContainText('A ready shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('ready');
    expect(errors).toEqual([]);
  });

  test('replaces a selected phrase and restores the original range on undo', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop native selection and physical keyboard history proof'
    );

    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('shared');
    await page.keyboard.type('better');
    await expect(proposed.root).toContainText('A better draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await controls.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(proposed.root).toContainText('A shared draft.');
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('shared');
    await controls.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect(proposed.root).toContainText('A better draft.');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('A better! draft.');
    expect(errors).toEqual([]);
  });

  test('types in one proposal view and reviews authors without changing another document', async ({
    page,
  }) => {
    const { accepted, errors, independent, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    await expect(proposed.root).toContainText('A better shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('better');

    await page.getByRole('combobox', { name: 'Author' }).selectOption('bob');
    await proposed.selection.collapse({ path: [0, 0], offset: 9 });
    await page.keyboard.type('bold ');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await page
      .getByRole('button', { name: 'Accept all Alice', exact: true })
      .click();
    await expect(accepted.root).toContainText('A better shared draft.');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await page
      .getByRole('button', { name: 'Reject all Bob', exact: true })
      .click();
    await expect(proposed.root).toContainText('A better shared draft.');
    await expect(proposed.root).not.toContainText('bold');
    await expect(
      page.getByText('No pending proposals.', { exact: true })
    ).toBeVisible();
    await expect(independent.root).toHaveText('A separate document.');
    expect(errors).toEqual([]);
  });

  test('switches exact-view mode and restores its proposed caret for follow-up typing', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    await controls
      .getByRole('button', { name: 'Edit accepted', exact: true })
      .click();
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(proposed.root).not.toContainText('better');
    await expect(proposed.root).toBeFocused();
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await expect(proposed.root).toContainText('A better shared draft.');
    await expect(proposed.root).toBeFocused();
    await page.keyboard.type('bold ');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('better');
    expect(errors).toEqual([]);
  });

  test('undoes and redoes one native proposal insertion with its caret', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.insertText('better ');
    await controls.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(proposed.root).not.toContainText('better');
    await controls.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect(proposed.root).toContainText('A better shared draft.');
    await page.keyboard.type('bold ');
    await expect(proposed.root).toContainText('A better bold shared draft.');
    await expect(accepted.root).toContainText('A shared draft.');
    await expect(accepted.root).not.toContainText('better');
    expect(errors).toEqual([]);
  });
});
