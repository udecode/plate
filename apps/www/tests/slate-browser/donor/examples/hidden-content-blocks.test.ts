import { expect, type Page, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

const dragTextRange = async (
  page: Page,
  {
    end,
    start,
  }: {
    end: { offset: number; text: string };
    start: { offset: number; text: string };
  }
) => {
  const points = await page.evaluate(
    ({ end, start }) => {
      const root = document.querySelector('#hidden-content-blocks-editor');

      if (!root) {
        throw new Error('Hidden content blocks editor is not mounted');
      }

      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.nodeValue?.trim()) {
          textNodes.push(node as Text);
        }
      }

      const pointFor = ({
        edge,
        offset,
        text,
      }: {
        edge: 'end' | 'start';
        offset: number;
        text: string;
      }) => {
        const node = textNodes.find((textNode) =>
          textNode.nodeValue?.includes(text)
        );

        if (!node) {
          throw new Error(`Cannot find text node containing "${text}"`);
        }

        const range = document.createRange();

        if (edge === 'end' && offset > 0) {
          range.setStart(node, offset - 1);
          range.setEnd(node, offset);
        } else {
          range.setStart(node, offset);
          range.setEnd(node, Math.min(offset + 1, node.length));
        }

        const rects = Array.from(range.getClientRects());
        const rect =
          edge === 'end'
            ? (rects.at(-1) ?? range.getBoundingClientRect())
            : (rects[0] ?? range.getBoundingClientRect());

        return {
          x: edge === 'end' ? rect.right - 1 : rect.left,
          y: rect.top + rect.height / 2,
        };
      };

      return {
        end: pointFor({ ...end, edge: 'end' }),
        start: pointFor({ ...start, edge: 'start' }),
      };
    },
    { end, start }
  );

  await page.mouse.move(points.start.x, points.start.y);
  await page.mouse.down();
  await page.mouse.move(points.end.x, points.end.y, { steps: 20 });
  await page.mouse.up();
};

const getNativeSelectionText = (page: Page) =>
  page.evaluate(() =>
    (window.getSelection()?.toString() ?? '').replace(/\n{2,}/g, '\n')
  );

test.describe('hidden content blocks example', () => {
  test('keeps active tab panel spacing stable when switching tabs', async ({
    page,
  }) => {
    await openExample(page, 'slate/hidden-content-blocks', {
      ready: {
        editor: 'visible',
        text: /Overview tab visible text/,
      },
    });

    const activePanelOffset = () =>
      page.evaluate(() => {
        const list = document.querySelector('[data-slot="tabs-list"]');
        const activePanel = document.querySelector(
          '[data-slot="tabs-content"][data-state="active"]'
        );

        if (!list || !activePanel) {
          throw new Error('Tabs layout is not mounted');
        }

        const listRect = list.getBoundingClientRect();
        const panelRect = activePanel.getBoundingClientRect();

        return Math.round((panelRect.top - listRect.bottom) * 100) / 100;
      });

    const overviewOffset = await activePanelOffset();

    await page.getByTestId('tab-details').click();
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );

    await expect.poll(activePanelOffset).toBe(overviewOffset);
  });

  test('keeps shadcn hidden content out of the DOM until opened', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      ready: {
        editor: 'visible',
        selector: '[data-test-id="accordion-trigger"]',
      },
    });

    await expect(editor.root).not.toContainText('Accordion secret alpha');
    await expect(editor.root).not.toContainText('Collapsible hidden note');
    await expect(editor.root).not.toContainText('Details tab hidden text');
    await expect(
      editor.root.locator('[data-slate-dom-coverage-boundary]')
    ).toHaveCount(3);
    await expect(
      page.getByTestId('hidden-content-native-surface')
    ).toContainText('degraded');

    await page.getByTestId('accordion-trigger').click();
    await expect(editor.root).toContainText('Accordion secret alpha');
    await expect(editor.root).toContainText('Accordion secret beta');

    await page.getByTestId('collapsible-trigger').click();
    await expect(editor.root).toContainText('Collapsible hidden note');

    await page.getByTestId('tab-details').click();
    await expect(editor.root).toContainText('Details tab hidden text');
    await expect(editor.root).not.toContainText('Overview tab visible text');
    await expect(
      editor.root.locator('[data-slate-dom-coverage-boundary]')
    ).toHaveCount(1);
    await expect.poll(() => pageErrors).toEqual([]);
  });

  test('copies model-backed shadcn hidden content while DOM is absent', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      ready: {
        editor: 'visible',
        selector: '[data-test-id="accordion-trigger"]',
      },
    });

    await expect(editor.root).not.toContainText('Accordion secret alpha');
    await page.getByTestId('select-copy-accordion').click();
    await expect(page.getByTestId('hidden-content-copy-preview')).toContainText(
      'Accordion secret alpha'
    );

    await expect(editor.root).not.toContainText('Collapsible hidden note');
    await page.getByTestId('select-copy-collapsible').click();
    await expect(page.getByTestId('hidden-content-copy-preview')).toContainText(
      'Collapsible hidden note'
    );

    await expect(editor.root).not.toContainText('Details tab hidden text');
    await page.getByTestId('select-copy-details').click();
    await expect(page.getByTestId('hidden-content-copy-preview')).toContainText(
      'Details tab hidden text'
    );

    await page.getByTestId('policy-copy-exclude').click();
    await expect(page.getByTestId('hidden-content-copy-policy')).toContainText(
      'exclude'
    );
    await page.getByTestId('select-copy-details').click();
    await expect(page.getByTestId('hidden-content-copy-preview')).toContainText(
      'copy payload appears here'
    );

    await page.getByTestId('policy-copy-materialize').click();
    await expect(page.getByTestId('hidden-content-copy-policy')).toContainText(
      'materialize'
    );
    await page.getByTestId('select-copy-details').click();
    await expect(page.getByTestId('hidden-content-copy-preview')).toContainText(
      'Details tab hidden text'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );
  });

  test('controls selection policy for inactive tab navigation', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      ready: {
        editor: 'visible',
        text: /Overview tab visible text/,
      },
    });

    await expect(
      page.getByTestId('hidden-content-selection-policy')
    ).toContainText('skip');

    const intro = 'Intro visible before hidden blocks.';
    await editor.selection.collapse({ offset: intro.length, path: [0, 0] });
    await page.keyboard.press('ArrowRight');
    await editor.assert.selection({
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
    await expect(editor.root).not.toContainText('Accordion secret alpha');
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'inactive'
    );

    const overview = 'Overview tab visible text';
    await editor.selection.collapse({
      offset: overview.length,
      path: [2, 0, 0],
    });
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('ArrowRight');
    }

    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'inactive'
    );
    await expect(editor.root).toContainText('Overview tab visible text');
    await expect(editor.root).not.toContainText('Details tab hidden text');

    await page.getByTestId('policy-selection-model').click();
    await expect(
      page.getByTestId('hidden-content-selection-policy')
    ).toContainText('model');
    await editor.selection.collapse({
      offset: overview.length,
      path: [2, 0, 0],
    });
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('ArrowRight');
    }

    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'inactive'
    );

    await page.getByTestId('policy-selection-materialize').click();
    await expect(
      page.getByTestId('hidden-content-selection-policy')
    ).toContainText('materialize');
    await editor.selection.collapse({
      offset: overview.length,
      path: [2, 0, 0],
    });
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('ArrowRight');
    }

    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'inactive'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(editor.root).not.toContainText('Overview tab visible text');
    await expect(editor.root).toContainText('Details tab hidden text');
  });

  test('materializes inactive tab keyboard selection matrix forward', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { selection: 'materialize' },
      ready: {
        editor: 'visible',
        text: /Overview tab visible text/,
      },
    });

    const overview = 'Overview tab visible text';

    await editor.selection.collapse({
      offset: overview.length,
      path: [2, 0, 0],
    });
    await page.keyboard.press('ArrowRight');
    await editor.assert.selection({
      anchor: { offset: 0, path: [2, 1, 0] },
      focus: { offset: 0, path: [2, 1, 0] },
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'inactive'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );

    await editor.selection.collapse({
      offset: overview.length,
      path: [2, 0, 0],
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );
    await page.keyboard.press('Shift+ArrowRight');
    await editor.assert.selection({
      anchor: { offset: overview.length, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 1, 0] },
    });
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );

    await page.keyboard.press('Shift+ArrowRight');
    await editor.assert.selection({
      anchor: { offset: overview.length, path: [2, 0, 0] },
      focus: { offset: 1, path: [2, 1, 0] },
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'inactive'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect.poll(() => getNativeSelectionText(page)).toBe('D');
    await expect.poll(() => pageErrors).toEqual([]);
  });

  test('does not cycle inactive tabs when extending a spanning materialized selection', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: {
        accordion_open: true,
        collapsible_open: true,
        selection: 'materialize',
      },
      ready: {
        editor: 'visible',
        text: /Overview tab visible text/,
      },
    });

    const beta = 'Accordion secret beta';
    const overview = 'Overview tab visible text';

    await editor.selection.select({
      anchor: { offset: beta.length, path: [1, 1, 0] },
      focus: { offset: overview.length, path: [2, 0, 0] },
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );

    await page.keyboard.press('Shift+ArrowRight');
    await editor.assert.selection({
      anchor: { offset: beta.length, path: [1, 1, 0] },
      focus: { offset: 0, path: [2, 1, 0] },
    });
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );

    await page.keyboard.press('Shift+ArrowRight');
    await editor.assert.selection({
      anchor: { offset: beta.length, path: [1, 1, 0] },
      focus: { offset: 1, path: [2, 1, 0] },
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'inactive'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect.poll(() => getNativeSelectionText(page)).toBe('D');
    await expect.poll(() => pageErrors).toEqual([]);
  });

  test('materializes inactive tab keyboard selection matrix backward', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { selection: 'materialize', tab: 'details' },
      ready: {
        editor: 'visible',
        text: /Details tab hidden text/,
      },
    });

    await editor.selection.collapse({
      offset: 0,
      path: [2, 1, 0],
    });
    await page.keyboard.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { offset: 'Overview tab visible text'.length, path: [2, 0, 0] },
      focus: { offset: 'Overview tab visible text'.length, path: [2, 0, 0] },
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'inactive'
    );

    await editor.selection.collapse({
      offset: 0,
      path: [2, 1, 0],
    });
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );
    await page.keyboard.press('Shift+ArrowLeft');
    await editor.assert.selection({
      anchor: { offset: 0, path: [2, 1, 0] },
      focus: { offset: 'Overview tab visible text'.length, path: [2, 0, 0] },
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );

    await page.keyboard.press('Shift+ArrowLeft');
    await editor.assert.selection({
      anchor: { offset: 0, path: [2, 1, 0] },
      focus: {
        offset: 'Overview tab visible text'.length - 1,
        path: [2, 0, 0],
      },
    });
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'inactive'
    );
    await expect.poll(() => getNativeSelectionText(page)).toBe('t');
    await expect.poll(() => pageErrors).toEqual([]);
  });

  test('materializes hidden block keyboard selection matrix vertically', async ({
    page,
  }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const pureBlockBoundarySelectionText =
      testInfo.project.name === 'firefox' ? '' : '\n';

    let editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { selection: 'materialize' },
      ready: {
        editor: 'visible',
        text: /Intro visible before hidden blocks/,
      },
    });

    const intro = 'Intro visible before hidden blocks.';

    await editor.selection.collapse({
      offset: 'Intro visible before '.length,
      path: [0, 0],
    });
    await page.keyboard.press('Shift+ArrowDown');
    await editor.assert.selection({
      anchor: { offset: 'Intro visible before '.length, path: [0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
    await expect(editor.root).toContainText('Accordion secret alpha');
    await expect
      .poll(() => getNativeSelectionText(page))
      .toBe('hidden blocks.\n');

    editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { selection: 'materialize' },
      ready: {
        editor: 'visible',
        text: /Intro visible before hidden blocks/,
      },
    });

    await editor.selection.collapse({
      offset: intro.length,
      path: [0, 0],
    });
    await page.keyboard.press('Shift+ArrowDown');
    await editor.assert.selection({
      anchor: { offset: intro.length, path: [0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
    await expect(editor.root).toContainText('Accordion secret alpha');
    await expect
      .poll(() => getNativeSelectionText(page))
      .toBe(pureBlockBoundarySelectionText);

    editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { selection: 'materialize', tab: 'details' },
      ready: {
        editor: 'visible',
        text: /Details tab hidden text/,
      },
    });

    const details = 'Details tab hidden text';

    await editor.selection.collapse({
      offset: details.length,
      path: [2, 1, 0],
    });
    await page.keyboard.press('Shift+ArrowDown');
    await editor.assert.selection({
      anchor: { offset: details.length, path: [2, 1, 0] },
      focus: { offset: 0, path: [3, 0, 0] },
    });
    await expect(editor.root).toContainText('Collapsible hidden note');
    await expect
      .poll(() => getNativeSelectionText(page))
      .toBe(pureBlockBoundarySelectionText);

    editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { selection: 'materialize' },
      ready: {
        editor: 'visible',
        text: /Outro visible after hidden blocks/,
      },
    });

    const outroStart = { offset: 0, path: [4, 0] };
    const collapsibleEnd = 'Collapsible hidden note'.length;

    await editor.selection.collapse(outroStart);
    await page.keyboard.press('Shift+ArrowUp');
    await editor.assert.selection({
      anchor: outroStart,
      focus: { offset: collapsibleEnd, path: [3, 0, 0] },
    });
    await expect(editor.root).toContainText('Collapsible hidden note');
    await expect
      .poll(() => getNativeSelectionText(page))
      .toBe(pureBlockBoundarySelectionText);
    await expect.poll(() => pageErrors).toEqual([]);
  });

  test('keeps shifted boundary navigation out of shadcn chrome selection', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      ready: {
        editor: 'visible',
        text: /Overview tab visible text/,
      },
    });

    const intro = 'Intro visible before hidden blocks.';
    await editor.selection.select({
      anchor: { offset: intro.length - 3, path: [0, 0] },
      focus: { offset: intro.length, path: [0, 0] },
    });
    await expect.poll(() => getNativeSelectionText(page)).toBe('ks.');
    await page.keyboard.press('Shift+ArrowRight');
    await editor.assert.selection({
      anchor: { offset: intro.length - 3, path: [0, 0] },
      focus: { offset: 1, path: [2, 0, 0] },
    });
    await expect.poll(() => getNativeSelectionText(page)).toBe('ks.\nO');
    await page.keyboard.press('Shift+ArrowRight');
    await editor.assert.selection({
      anchor: { offset: intro.length - 3, path: [0, 0] },
      focus: { offset: 2, path: [2, 0, 0] },
    });
    await expect.poll(() => getNativeSelectionText(page)).toBe('ks.\nOv');
    await expect(page.getByTestId('tab-overview')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'inactive'
    );

    await editor.selection.select({
      anchor: { offset: intro.length - 3, path: [0, 0] },
      focus: { offset: intro.length, path: [0, 0] },
    });
    await page.keyboard.press('Control+Shift+ArrowRight');
    await editor.assert.selection({
      anchor: { offset: intro.length - 3, path: [0, 0] },
      focus: { offset: 'Overview'.length, path: [2, 0, 0] },
    });
    await expect.poll(() => getNativeSelectionText(page)).toBe('ks.\nOverview');
    await expect(editor.root).not.toContainText('Accordion secret alpha');
    await expect(editor.root).not.toContainText('Details tab hidden text');
  });

  test('preserves the unselected active tab suffix when deleting across visible hidden content', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop mouse drag proof');

    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { accordion_open: true },
      ready: {
        editor: 'visible',
        text: /Accordion secret alpha/,
      },
    });

    await dragTextRange(page, {
      start: {
        offset: 'Intro visible '.length,
        text: 'Intro visible before hidden blocks.',
      },
      end: {
        offset: 'Overview tab'.length,
        text: 'Overview tab visible text',
      },
    });

    await expect
      .poll(() => getNativeSelectionText(page))
      .toBe(
        [
          'before hidden blocks.',
          'Accordion secret alpha',
          'Accordion secret beta',
          'Overview tab',
        ].join('\n')
      );

    await page.keyboard.press('Backspace');

    await expect.poll(() => editor.get.modelText()).toContain(' visible text');
    await expect(editor.root).not.toContainText('Accordion secret alpha');
    await expect(
      page.locator('[data-slot="tabs-content"][data-state="active"]')
    ).toContainText(' visible text');
    await expect(
      page.locator('[data-slot="tabs-content"][data-state="active"]')
    ).not.toContainText('Details tab hidden text');
  });

  test('preserves the unselected second tab suffix when deleting across visible hidden content', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop mouse drag proof');

    const editor = await openExample(page, 'slate/hidden-content-blocks', {
      query: { accordion_open: true, tab: 'details' },
      ready: {
        editor: 'visible',
        text: /Details tab hidden text/,
      },
    });

    await dragTextRange(page, {
      start: {
        offset: 'Intro visible '.length,
        text: 'Intro visible before hidden blocks.',
      },
      end: {
        offset: 'Details tab'.length,
        text: 'Details tab hidden text',
      },
    });

    await expect
      .poll(() => getNativeSelectionText(page))
      .toBe(
        [
          'before hidden blocks.',
          'Accordion secret alpha',
          'Accordion secret beta',
          'Details tab',
        ].join('\n')
      );

    await page.keyboard.press('Backspace');

    await expect.poll(() => editor.get.modelText()).toContain(' hidden text');
    await expect(editor.root).not.toContainText('Accordion secret alpha');
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(
      page.locator('[data-slot="tabs-content"][data-state="active"]')
    ).toContainText(' hidden text');
    await expect(
      page.locator('[data-slot="tabs-content"][data-state="active"]')
    ).not.toContainText('Overview tab visible text');
  });
});
