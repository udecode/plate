import {
  BROWSER_HANDLE_KEY,
  measureTrustedTyping,
  openExample,
  recordBrowserRuntimeErrors,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

import type { PliteBrowserHandle } from '../../../../packages/plitejs/src/react/editable/browser-handle';

type ReviewNode = {
  authored?: ReadonlyArray<{ kind: string }>;
  children?: ReviewNode[];
  text?: string;
  type?: string;
};

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

type Review = Awaited<ReturnType<typeof openReview>>;

const label = (node: ReviewNode) => {
  const kinds = (node.authored ?? []).map((mark) => mark.kind).join(',');
  const body = node.text ?? `<${node.type}>`;
  return kinds ? `${body}[${kinds}]` : body;
};

const leaves = async (surface: Review['proposed'], path: number[]) => {
  const value = (await surface.get.modelValue()) as ReviewNode;
  const node = path.reduce<ReviewNode>(
    (current, index) => current.children![index],
    value
  );
  return node.children!.map(label);
};

const marked = async (surface: Review['proposed']) => {
  const count = (node: ReviewNode): number =>
    ((node.authored ?? []).some(
      (member) => member.kind !== 'held' && member.kind !== 'in'
    )
      ? 1
      : 0) +
    (node.children ?? []).reduce((sum, child) => sum + count(child), 0);
  return count((await surface.get.modelValue()) as ReviewNode);
};

const pending = (page: Page) =>
  page.getByLabel('Pending proposals', { exact: true }).locator('li');

test.describe('native authored changes', () => {
  test('groups contiguous browser Backspaces into one pending proposal', async ({
    page,
  }) => {
    const { accepted, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 15 });
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A shared draf', 't.[delete]']);
    await expect(pending(page)).toHaveCount(1);
    await expect(accepted.root).toContainText('A shared draft.');
    expect(errors).toEqual([]);
  });

  test('large shared views preserve native input and reachable controls', async ({
    page,
  }) => {
    test.slow();

    const { accepted, controls, errors, proposed } = await openReview(page);
    await controls.getByRole('button', { name: 'Edit', exact: true }).click();
    await proposed.scenario.run('seed shared large document', [
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
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await proposed.root.evaluate((element, key) => {
      const handle = (
        element as HTMLElement & Record<string, PliteBrowserHandle>
      )[key];
      for (let index = 0; index < 1000; index++) {
        handle.deleteTextAt({
          anchor: { path: [index, 0], offset: 1 },
          focus: { path: [index, 0], offset: 2 },
        });
      }
    }, BROWSER_HANDLE_KEY);
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
    await expect(
      controls.getByRole('button', { name: 'Suggest', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    await proposed.selection.collapse({ path: [999, 2], offset: 3 });
    await proposed.type('!');
    expect(await accepted.get.modelText()).toBe('Seed.'.repeat(1000));
    expect(await proposed.get.modelText()).toBe(`${'Seed.'.repeat(1000)}!`);
    expect(await leaves(proposed, [999])).toEqual([
      'S',
      'e[delete]',
      'ed.',
      '![insert]',
    ]);
    expect(errors).toEqual([]);
  });

  for (const projection of ['edit', 'proposed', 'named-root'] as const) {
    test(`measures trusted typing against the ${projection} view`, async ({
      page,
    }, info) => {
      const { controls, errors, proposed } = await openReview(page);
      if (projection === 'edit') {
        await controls
          .getByRole('button', { name: 'Edit', exact: true })
          .click();
        await proposed.selection.collapse({ path: [0, 0], offset: 0 });
      } else if (projection === 'proposed') {
        await proposed.selection.collapse({ path: [0, 0], offset: 2 });
        await proposed.type('!');
      } else {
        await page
          .getByLabel('Sample document', { exact: true })
          .selectOption('named-root');
        await proposed.selection.select({
          anchor: { path: [0, 0, 0], offset: 1 },
          focus: { path: [1, 0, 0], offset: 1 },
        });
        await page.keyboard.press('Backspace');
        await proposed.selection.collapse({ path: [0, 0, 0], offset: 1 });
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
    test(`selects struck media at the ${position} document edge through native keys`, async ({
      page,
    }, info) => {
      test.skip(
        info.project.name === 'mobile',
        'Native clipboard shortcuts require a desktop browser.'
      );
      const { accepted, errors, proposed } = await openReview(page);
      await page
        .getByLabel('Sample document', { exact: true })
        .selectOption(`media-${position}`);
      const mediaIndex = position === 'last' ? 1 : 0;
      const media = proposed.root.locator('[data-authored-atomic="media"]');
      await media.click();
      await page.keyboard.press('Backspace');
      await expect(media).toHaveText('Preview');
      await expect
        .poll(() => leaves(proposed, []))
        .toContain('<media>[delete]');
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
      if (position === 'only') {
        const lock = page.getByLabel('Read-only proposed view', {
          exact: true,
        });
        await lock.check();
        await proposed.root.focus();
        const lockedCopy = await proposed.clipboard.copyNativeEventPayload();
        expect(lockedCopy.fragment).toBe(copied.fragment);
        await page.keyboard.type('X');
        await proposed.assert.modelBlockTexts(['']);
        await lock.uncheck();
        await page
          .getByRole('button', { name: 'Reject all Alice', exact: true })
          .click();
        await proposed.assert.modelBlockTexts(['']);
        await expect.poll(() => marked(proposed)).toBe(0);
      }
      if (position !== 'only') {
        const paragraph = position === 'first' ? [1, 0] : [0, 0];
        await proposed.selection.collapse({
          path: paragraph,
          offset: position === 'first' ? 0 : 2,
        });
        await page.keyboard.press(
          position === 'first' ? 'Shift+ArrowLeft' : 'Shift+ArrowRight'
        );
        await expect(media).toHaveAttribute('data-selected', 'true');
        const atom = await proposed.clipboard.copyNativeEventPayload();
        expect(
          JSON.parse(
            decodeURIComponent(Buffer.from(atom.fragment!, 'base64').toString())
          ).slice.content
        ).toContainEqual({
          type: 'media',
          label: 'Preview',
          children: [{ text: '' }],
        });
        await page.keyboard.press(
          position === 'first' ? 'ArrowRight' : 'ArrowLeft'
        );
        await expect(media).toHaveAttribute('data-selected', 'false');
        await page.keyboard.type('!');
        await expect
          .poll(() => leaves(proposed, paragraph.slice(0, 1)))
          .toEqual(
            position === 'first' ? ['![insert]', 'AB'] : ['AB', '![insert]']
          );
        const settled = await leaves(proposed, []);

        expect(settled[mediaIndex]).toBe('<media>[delete]');
      }
      await expect(
        accepted.root.locator('[data-authored-atomic="media"]')
      ).toHaveText('Preview');
      expect(errors).toEqual([]);
    });
  }

  test('keeps struck atomic selection and copying when the proposed view is read-only', async ({
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
    const lock = page.getByLabel('Read-only proposed view', { exact: true });
    await lock.check();
    await expect(proposed.root).toHaveAttribute('aria-readonly', 'true');
    await expect(
      controls.getByRole('button', { name: 'Undo', exact: true })
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Reject all Alice', exact: true })
    ).toBeDisabled();
    await proposed.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 1 },
    });
    const copied = await proposed.clipboard.copyNativeEventPayload();
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
    const locked = await proposed.get.modelValue();
    await page.keyboard.type('X');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('ControlOrMeta+z');
    await page.keyboard.press('ControlOrMeta+x');
    expect(await proposed.get.modelValue()).toEqual(locked);
    expect(await leaves(proposed, [0])).toEqual([
      'A',
      '<mention>[delete]',
      'B',
    ]);
    await lock.uncheck();
    await expect(
      controls.getByRole('button', { name: 'Undo', exact: true })
    ).toBeEnabled();
    await proposed.selection.collapse({ path: [2, 0], offset: 2 });
    await page.keyboard.type('?');
    await proposed.assert.modelBlockTexts(['AB', '', 'CD?']);
    await accepted.assert.modelBlockTexts(['AB', '', 'CD']);
    expect(errors).toEqual([]);
  });

  test('selects a struck mention as one native character in both directions', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('atomics');
    await proposed.selection.collapse({ path: [0, 2], offset: 0 });
    await page.keyboard.press('Backspace');
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    for (const direction of ['Right', 'Left']) {
      await page.keyboard.press(`Shift+Arrow${direction}`);
      await expect(
        proposed.root.locator('[data-authored-atomic="mention"]')
      ).toHaveAttribute('data-selected', 'true');
      const copied = await proposed.clipboard.copyNativeEventPayload();
      expect(copied.fragment).toBeTruthy();
      const fragment = JSON.parse(
        decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
      );
      expect(fragment.slice.content[0].children).toContainEqual({
        type: 'mention',
        label: 'Alice',
        children: [{ text: '' }],
      });
      await proposed.selection.collapse({ path: [0, 0], offset: 1 });
      if (direction === 'Right') {
        await proposed.selection.collapse({ path: [0, 2], offset: 0 });
      }
    }
    await proposed.selection.collapse({ path: [0, 2], offset: 1 });
    await page.keyboard.type('!');
    await proposed.assert.modelBlockTexts(['AB!', '', 'CD']);
    expect(errors).toEqual([]);
  });

  test('strikes an inline mention through native deletion, history and rejection', async ({
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
    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A', '<mention>[delete]', 'B']);
    await expect(mention).toHaveText('@Alice');
    await expect(
      accepted.root.locator('[data-authored-atomic="mention"]')
    ).toHaveText('@Alice');
    await page.keyboard.press('ControlOrMeta+z');
    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A', '<mention>', 'B']);
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A', '<mention>[delete]', 'B']);
    await proposed.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 1 },
    });
    const copied = await proposed.clipboard.copyNativeEventPayload();
    const fragment = JSON.parse(
      decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
    );
    expect(fragment.slice.content).toHaveLength(1);
    expect(fragment.slice.content[0].children).toContainEqual({
      type: 'mention',
      label: 'Alice',
      children: [{ text: '' }],
    });
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(mention).toHaveText('@Alice');
    await expect.poll(() => marked(proposed)).toBe(0);
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await proposed.selection.collapse({ path: [0, 2], offset: 0 });
    await page.keyboard.type('!');
    await expect.poll(() => leaves(proposed, [0])).toContain('![insert]');
    await proposed.assert.modelBlockTexts(['A!B', '', 'CD']);
    await accepted.assert.modelBlockTexts(['AB', '', 'CD']);
    expect(errors).toEqual([]);
  });

  test('copies struck block media with native selection and preserves the following input', async ({
    page,
  }, info) => {
    test.skip(
      info.project.name === 'mobile',
      'Native clipboard shortcuts require a desktop browser.'
    );
    const { accepted, errors, proposed } = await openReview(page);
    await page
      .getByLabel('Sample document', { exact: true })
      .selectOption('atomics');
    const media = proposed.root.locator('[data-authored-atomic="media"]');
    await media.click();
    await page.keyboard.press('Backspace');
    await proposed.selection.collapse({ path: [0, 0], offset: 0 });
    await page.keyboard.press('ControlOrMeta+a');
    await expect(media).toHaveAttribute('data-selected', 'true');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    const fragment = JSON.parse(
      decodeURIComponent(Buffer.from(copied.fragment!, 'base64').toString())
    );
    expect(fragment.slice.content).toHaveLength(3);
    expect(fragment.slice.content[1]).toEqual({
      type: 'media',
      label: 'Preview',
      children: [{ text: '' }],
    });
    await page.keyboard.press('ArrowRight');
    await expect(media).toHaveAttribute('data-selected', 'false');
    await page.keyboard.type('!');
    await proposed.assert.modelBlockTexts(['AB', '', 'CD!']);
    await accepted.assert.modelBlockTexts(['AB', '', 'CD']);
    expect(errors).toEqual([]);
  });

  test('strikes block media through native deletion, history and rejection', async ({
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
    await expect
      .poll(() => leaves(proposed, []))
      .toEqual(['<paragraph>', '<media>[delete]', '<paragraph>']);
    await expect(media).toHaveText('Preview');
    await expect(
      accepted.root.locator('[data-authored-atomic="media"]')
    ).toHaveText('Preview');
    await page.keyboard.press('ControlOrMeta+z');
    await expect.poll(() => marked(proposed)).toBe(0);
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect.poll(() => leaves(proposed, [])).toContain('<media>[delete]');
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(media).toHaveText('Preview');
    await expect.poll(() => marked(proposed)).toBe(0);
    await controls
      .getByRole('button', { name: 'Suggest', exact: true })
      .click();
    await proposed.selection.collapse({ path: [2, 0], offset: 2 });
    await page.keyboard.type('!');
    await proposed.assert.modelBlockTexts(['AB', '', 'CD!']);
    await expect(accepted.root).toContainText('CD');
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
      await controls.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(
        controls.getByRole('button', { name: 'Suggest', exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 0,
        text: '',
      });
      await expect(
        controls.getByRole('button', { name: 'Edit', exact: true })
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
      const blocks = cell.locator(':scope > [data-editor-node="element"]');
      await startBrowserNativeEventTrace(proposed.root);
      const client = await page.context().newCDPSession(page);
      try {
        await client.send('Input.imeSetComposition', {
          selectionStart: 1,
          selectionEnd: 1,
          text: 'n',
        });
        await expect(blocks).toHaveText(['AnB', 'CD']);
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
        await expect(blocks).toHaveText(
          finish === 'commit' ? ['AにB', 'CD'] : ['AB', 'CD']
        );
        await expect(pending(page)).toHaveCount(finish === 'commit' ? 2 : 1);
        const value = await proposed.get.modelValue();
        await controls
          .getByRole('button', { name: 'Undo', exact: true })
          .click();
        await expect.poll(() => marked(proposed)).toBe(0);
        await expect(blocks).toHaveText(['AB', 'CD']);
        expect(await proposed.get.selection()).toEqual(selection);
        await controls
          .getByRole('button', { name: 'Redo', exact: true })
          .click();
        await expect.poll(() => proposed.get.modelValue()).toEqual(value);
        await expect(accepted.root.locator('td').first()).toHaveText('ABCD');
        await proposed.selection.collapse({ path: [0, 0, 0, 0, 0], offset: 1 });
        await page.keyboard.type('!');
        await expect(blocks).toHaveText(
          finish === 'commit' ? ['A!にB', 'CD'] : ['A!B', 'CD']
        );
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
      await controls.getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(
        controls.getByRole('button', { name: 'Suggest', exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'に',
      });
      await client.send('Input.insertText', { text: 'に' });
      await expect(
        controls.getByRole('button', { name: 'Edit', exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(proposed.root).toHaveText('ABCDに');
      await expect
        .poll(() => leaves(proposed, [1, 0]))
        .toEqual(['CD', 'に[insert]']);
      await expect(accepted.root).toHaveText('ABCD');
      await controls
        .getByRole('button', { name: 'Suggest', exact: true })
        .click();
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

  test('composes ordinary text beside a struck paragraph through Chromium input', async ({
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
    await proposed.selection.select({
      anchor: { path: [0, 0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 1, 0], offset: 1 },
    });
    await page.keyboard.press('Backspace');
    await proposed.selection.collapse({ path: [0, 0, 0, 1, 1], offset: 1 });
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
      await expect.poll(() => marked(proposed)).toBe(0);
      expect(errors).toEqual([]);
    } finally {
      await info.attach('chromium-struck-composition.json', {
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
      const { accepted, errors, proposed } = await openReview(page);
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
      await expect
        .poll(() => leaves(proposed, [0, 1]))
        .toEqual(side === 'prefix' ? ['B[delete]', 'C'] : ['B', 'C[delete]']);
      const link = proposed.root.locator('a');
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', '/docs');
      await expect
        .poll(() =>
          link.evaluate((node) => node.textContent?.replaceAll('﻿', ''))
        )
        .toBe('BC');
      await proposed.selection.collapse(
        side === 'prefix' ? { path: [0, 1, 1], offset: 1 } : middle
      );
      await page.keyboard.type('!');
      await expect
        .poll(() =>
          link.evaluate((node) => node.textContent?.replaceAll('﻿', ''))
        )
        .toBe(side === 'prefix' ? 'BC!' : 'B!C');
      await expect(accepted.root).toHaveText('ABCD');
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(link).toHaveText('BC');
      await proposed.assert.modelBlockTexts(['ABCD']);
      await expect.poll(() => marked(proposed)).toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test('replaces ordinary text beside a struck paragraph and preserves undo', async ({
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
    await proposed.selection.select({
      anchor: { path: [0, 0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 1, 0], offset: 1 },
    });
    await page.keyboard.press('Backspace');
    await expect(blocks).toHaveText(['AB', 'CD']);
    await proposed.selection.collapse({ path: [0, 0, 0, 1, 1], offset: 1 });
    await page.keyboard.press('Shift+ArrowLeft');
    await expect.poll(() => proposed.get.selectedText()).toBe('D');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe('D');
    await page.keyboard.type('X');
    await expect(blocks).toHaveText(['AB', 'CDX']);
    await expect(accepted.root.locator('td').first()).toHaveText('ABCD');
    for (let cycle = 0; cycle < 2; cycle += 1) {
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      await expect(blocks).toHaveText(['AB', 'CD']);
      await expect.poll(() => proposed.get.selectedText()).toBe('D');
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
    test(`keeps struck structure and native input inside ${sample}`, async ({
      page,
    }) => {
      const { accepted, errors, proposed } = await openReview(page);
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
      await expect(blocks).toHaveText(table ? ['AB', 'CD'] : ['ABCD', 'CD']);
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
      await expect.poll(() => marked(proposed)).toBe(0);
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
    test(`strikes native quote structure and rejects it for ${sample}`, async ({
      page,
    }) => {
      const { accepted, errors, proposed } = await openReview(page);
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
      const blocks = proposed.root.locator(
        ':scope > [data-editor-node="element"]'
      );
      await expect(
        accepted.root.locator(':scope > [data-editor-node="element"]')
      ).toHaveText(['AB', 'CD']);
      await test.info().attach('quote-struck-tree.json', {
        body: JSON.stringify(await proposed.get.modelValue(), null, 2),
        contentType: 'application/json',
      });
      await expect(proposed.root.locator('blockquote')).toHaveCount(
        sample === 'two-quotes' ? 2 : 1
      );
      await proposed.selection.collapse({ path: first, offset: 1 });
      await page.keyboard.type('!');
      await expect(blocks.first()).toContainText('A!B');
      await page
        .getByRole('button', { name: 'Reject all Alice', exact: true })
        .click();
      await expect(blocks).toHaveText(['AB', 'CD']);
      await expect.poll(() => marked(proposed)).toBe(0);
      await proposed.selection.collapse({ path: second, offset: 1 });
      await page.keyboard.type('?');
      await expect(blocks).toHaveText(['AB', 'C?D']);
      await expect(
        accepted.root.locator(':scope > [data-editor-node="element"]')
      ).toHaveText(['AB', 'CD']);
      expect(errors).toEqual([]);
    });
  }

  test('strikes paragraph boundaries through native range deletion, selection and rejection', async ({
    page,
  }) => {
    const { accepted, errors, proposed } = await openReview(page);
    const paragraphs = [
      'A shared draft.',
      'Select a phrase, type a replacement, and review the result.',
    ];
    await proposed.selection.select({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 6 },
    });
    await page.keyboard.press('Backspace');
    const blocks = proposed.root.locator('[data-editor-node="element"]');
    await expect(blocks).toHaveText(paragraphs);
    await expect(
      accepted.root.locator('[data-editor-node="element"]')
    ).toHaveText(paragraphs);
    await expect(pending(page)).toHaveCount(1);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 20; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await test.info().attach('struck-paragraph-selection.json', {
      body: JSON.stringify({
        selection: await proposed.get.selection(),
        selected: await proposed.get.selectedText(),
      }),
      contentType: 'application/json',
    });
    await expect
      .poll(() => proposed.get.selectedText())
      .toBe('shared draft.\nSelec');
    await proposed.assert.noDoubleSelectionHighlight();
    await page
      .getByRole('button', { name: 'Reject all Alice', exact: true })
      .click();
    await expect(blocks).toHaveText(paragraphs);
    await expect.poll(() => marked(proposed)).toBe(0);
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

  test('extends to visual line edges across struck content with Home and End', async ({
    page,
  }) => {
    const { errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Shift+ArrowRight');
    }
    await page.keyboard.press('Backspace');
    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A ', 'shared[delete]', ' draft.']);
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+Shift+ArrowRight' : 'Shift+End'
    );
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(' shared draft.');
    await page.keyboard.press('Home');
    await page.keyboard.type('!');
    await expect(proposed.root).toContainText('!A shared draft.');
    expect(errors).toEqual([]);
  });

  for (const side of ['before', 'after'] as const) {
    test(`collapses ${side} struck text and preserves native typing through review and history`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name === 'mobile',
        'Desktop native caret and physical keyboard proof'
      );

      const { accepted, controls, errors, proposed } = await openReview(page);
      await proposed.selection.select({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 8 },
      });
      await page.keyboard.press('Backspace');
      await page.getByRole('combobox', { name: 'Author' }).selectOption('bob');
      await proposed.selection.select({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 2], offset: 0 },
      });
      await page.keyboard.press(side === 'after' ? 'ArrowRight' : 'ArrowLeft');
      await expect
        .poll(() => proposed.get.selection())
        .toEqual(
          side === 'after'
            ? {
                anchor: { path: [0, 2], offset: 0 },
                focus: { path: [0, 2], offset: 0 },
              }
            : {
                anchor: { path: [0, 0], offset: 2 },
                focus: { path: [0, 0], offset: 2 },
              }
        );
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
      await page
        .getByRole('button', { name: 'Accept all Bob', exact: true })
        .click();
      await expect(accepted.root).toContainText(expected);
      await expect.poll(() => marked(proposed)).toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test('uses native word shortcuts across struck text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop physical keyboard shortcut proof'
    );

    const { errors, proposed } = await openReview(page);
    await proposed.selection.select({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 8 },
    });
    await page.keyboard.press('Backspace');
    await proposed.selection.collapse({ path: [0, 0], offset: 1 });
    const modifier = process.platform === 'darwin' ? 'Alt' : 'Control';
    const { selectedText } = proposed.get;
    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);
    await expect.poll(selectedText).toBe(' shared');
    const copied = await proposed.clipboard.copyNativeEventPayload();
    expect(copied.text).toBe(' shared');
    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);
    await expect.poll(selectedText).toBe(' shared draft');
    await page.keyboard.press(`${modifier}+Shift+ArrowLeft`);
    await expect.poll(selectedText).toBe(' shared ');
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
    await page.keyboard.insertText('👩🏽‍💻é🙂');
    await expect(proposed.root).toContainText('A 👩🏽‍💻é🙂shared draft.');
    await page.keyboard.press('Backspace');
    await expect(proposed.root).toContainText('A 👩🏽‍💻éshared draft.');
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
    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A ', 'shared[delete]', 'better[insert]', ' draft.']);
    await expect(accepted.root).toContainText('A shared draft.');
    let undoCount = 0;
    while (undoCount < 'better'.length && (await marked(proposed)) > 0) {
      await controls.getByRole('button', { name: 'Undo', exact: true }).click();
      undoCount += 1;
    }
    await expect.poll(() => marked(proposed)).toBe(0);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toBe('shared');
    for (let index = 0; index < undoCount; index++) {
      await controls.getByRole('button', { name: 'Redo', exact: true }).click();
    }
    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A ', 'shared[delete]', 'better[insert]', ' draft.']);
    await page.keyboard.type('!');
    await expect
      .poll(() => leaves(proposed, [0]))
      .toEqual(['A ', 'shared[delete]', 'better![insert]', ' draft.']);
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
    await proposed.selection.collapse({ path: [0, 2], offset: 0 });
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

  test('switches to the accepted preview and restores the proposed caret for follow-up typing', async ({
    page,
  }) => {
    const { accepted, controls, errors, proposed } = await openReview(page);
    await proposed.selection.collapse({ path: [0, 0], offset: 2 });
    await page.keyboard.type('better ');
    await controls
      .getByRole('button', { name: 'Preview accepted', exact: true })
      .click();
    await expect(proposed.root).toContainText('A shared draft.');
    await expect(proposed.root).not.toContainText('better');
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
