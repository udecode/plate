import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const EDITOR_ROOT = '[data-plite-editor="true"][contenteditable="true"]';

test('inactive selection paints expanded and collapsed selections 5/5', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/inactive-selection-demo', {
      waitUntil: 'commit',
    });

    const root = page.locator(EDITOR_ROOT);
    const editor = createPliteBrowserEditorHarness(
      page,
      'inactive-selection',
      root
    );
    const retain = page.getByRole('button', {
      name: 'Keep selection visible',
    });
    const clear = page.getByRole('button', { name: 'Clear selection paint' });
    const fill = page.locator('[data-plite-inactive-selection]');
    const caret = page.locator('[data-plite-inactive-selection-caret]');
    const waitForSelectionCommit = () =>
      page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      });

    await editor.ready({
      editor: 'visible',
      text: 'Select this sentence, then move focus to either control.',
    });

    for (let run = 0; run < 5; run++) {
      await root.click();
      await root.press('ControlOrMeta+A');
      await root.press('ArrowLeft');
      for (let offset = 0; offset < 4; offset++) {
        await root.press('Shift+ArrowRight');
      }
      await editor.assert.selection({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
      await expect
        .poll(() => page.evaluate(() => getSelection()?.toString()))
        .toBe('Sele');
      await waitForSelectionCommit();
      await retain.click();
      await expect(retain).toBeFocused();
      await expect(fill).toHaveCount(1);
      await expect(fill).toHaveText('Sele');
      await expect(caret).toHaveCount(0);

      await clear.click();
      await expect(fill).toHaveCount(0);
      await expect(caret).toHaveCount(0);

      await root.click();
      await root.press('ControlOrMeta+A');
      await root.press('ArrowLeft');
      await editor.assert.selection({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
      await expect
        .poll(() => page.evaluate(() => getSelection()?.isCollapsed))
        .toBe(true);
      await waitForSelectionCommit();
      await retain.click();
      await expect(retain).toBeFocused();
      await expect(fill).toHaveCount(0);
      await expect(caret).toHaveCount(1);
      await clear.click();
    }

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('Find highlights, wraps, closes, and returns editor input', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/find-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT);
    const editor = createPliteBrowserEditorHarness(page, 'find', root);

    await expect(root).toBeVisible();
    await editor.focus();
    await editor.press('ControlOrMeta+f');

    const search = page.getByRole('search', { name: 'Find in document' });
    const input = page.getByRole('searchbox', { name: 'Find text' });
    const matches = page.locator('[data-find-match]');
    const active = page.locator('[data-find-active]');

    await expect(search).toHaveCount(1);
    const searchWinsStacking = await search.evaluate((element) => {
      const toolbar = element.ownerDocument.querySelector('[role="toolbar"]');

      if (!toolbar) return true;

      const searchRect = element.getBoundingClientRect();
      const toolbarRect = toolbar.getBoundingClientRect();
      const overlapTop = Math.max(searchRect.top, toolbarRect.top);
      const overlapBottom = Math.min(searchRect.bottom, toolbarRect.bottom);
      const overlapHeight = Math.max(0, overlapBottom - overlapTop);

      if (overlapHeight === 0) return true;

      const topElement = element.ownerDocument.elementFromPoint(
        Math.min(searchRect.right, toolbarRect.right) - 1,
        overlapTop + overlapHeight / 2
      );

      return Boolean(topElement && element.contains(topElement));
    });

    expect(searchWinsStacking).toBe(true);

    await input.fill('the');
    await expect(search).toContainText('1 of 2');
    await expect(matches).toHaveCount(2);
    await expect(active).toHaveCount(1);

    await input.press('Enter');
    await expect(search).toContainText('2 of 2');
    await input.press('Enter');
    await expect(search).toContainText('1 of 2');
    await input.press('Shift+Enter');
    await expect(search).toContainText('2 of 2');

    await input.press('Escape');
    await expect(search).toHaveCount(0);
    await expect(matches).toHaveCount(0);
    await expect(root).toBeFocused();
    await page.keyboard.type('!');
    await expect(root).toContainText('!');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('Yjs remote selection and caret geometry pass 5/5', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/collaboration-demo', { waitUntil: 'commit' });

    const ada = page.getByRole('textbox', {
      name: 'Ada collaborative editor',
    });
    const lin = page.getByRole('textbox', {
      name: 'Lin collaborative editor',
    });
    const editor = createPliteBrowserEditorHarness(page, 'yjs-ada', ada);
    const remoteSelection = page.locator('[data-remote-selection]');
    const remoteCaret = page.locator('[data-remote-caret]');
    const remoteLabel = page.locator('[data-remote-cursor-label]');

    await expect(ada).toBeVisible();
    await expect(lin).toBeVisible();

    for (let run = 0; run < 5; run++) {
      await editor.focus();
      await editor.selection.select({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 12, path: [0, 0] },
      });
      await expect.poll(() => remoteSelection.count()).toBeGreaterThan(0);
      await expect(remoteCaret).toHaveCount(1);
      await expect(remoteLabel).toHaveText('Ada');

      await editor.selection.collapse({ offset: 12, path: [0, 0] });
      await expect(remoteSelection).toHaveCount(0);
      await expect(remoteCaret).toHaveCount(1);
      await expect(remoteLabel).toHaveText('Ada');
    }

    await editor.focus();
    await editor.type('!');
    await expect(ada).toContainText('!');
    await expect(lin).toContainText('!');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('floating toolbar tracks exact selection geometry 5/5', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/floating-toolbar-demo', { waitUntil: 'commit' });

    const root = page.locator(EDITOR_ROOT);
    const editor = createPliteBrowserEditorHarness(
      page,
      'floating-toolbar',
      root
    );
    const toolbars = page.getByRole('toolbar');

    await expect(root).toBeVisible();
    await expect(toolbars).toHaveCount(1);

    for (let run = 0; run < 5; run++) {
      await editor.focus();
      await editor.selectAll();
      await expect(toolbars).toHaveCount(2);

      const box = await toolbars.nth(1).boundingBox();

      expect(box).not.toBeNull();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect(box?.y).toBeGreaterThanOrEqual(0);

      await editor.selection.collapse({ offset: 12, path: [1, 0] });
      await expect(toolbars).toHaveCount(1);
    }

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('link floating editor submits on Enter from exact geometry', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion });
      await page.goto('/blocks/link-demo', { waitUntil: 'commit' });

      const link = page.getByRole('link', { name: 'hyperlinks' });
      const root = page.locator(EDITOR_ROOT);
      const editor = createPliteBrowserEditorHarness(page, 'link', root);

      await editor.selection.collapse({ offset: 2, path: [1, 1, 0] });
      await editor.focus();
      await page.getByRole('button', { name: 'Edit link' }).click();

      const input = page.getByPlaceholder('Paste link').last();

      await expect(input).toBeVisible();
      await expect(input).toBeFocused();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('https://platejs.org');
      await page.keyboard.press('Enter');

      await expect(input).toBeHidden();
      await expect(link).toHaveAttribute('href', /^https:\/\/platejs\.org\/?$/);
      await expect(root).toBeFocused();
    }
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('link floating editor opens from an empty paragraph 5/5', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion });
      await page.goto('/blocks/link-demo', { waitUntil: 'commit' });

      const root = page.locator(EDITOR_ROOT);
      const editor = createPliteBrowserEditorHarness(page, 'link-empty', root);
      const input = page.getByPlaceholder('Paste link').last();
      const emptyLine = root.locator('[data-plite-zero-width]');

      await expect(root).toBeVisible();
      await editor.focus();
      await editor.selectAll();
      await editor.press('Backspace');
      await editor.assert.selection({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
      await page.evaluate(() => {
        const owner = (target: EventTarget | null) => {
          if (!(target instanceof Element)) return 'none';
          if (target.matches('input[placeholder="Paste link"]')) {
            return 'url-input';
          }
          if (
            target.matches('[data-plite-editor="true"][contenteditable="true"]')
          ) {
            return 'editor';
          }

          return target.tagName.toLowerCase();
        };
        const record = (event: FocusEvent) => {
          const events = Reflect.get(window, '__linkFocusEvents') as Array<{
            event: string;
            owner: string;
            related: string;
          }>;

          events.push({
            event: event.type,
            owner: owner(event.target),
            related: owner(event.relatedTarget),
          });
        };

        Reflect.set(window, '__linkFocusEvents', []);
        document.addEventListener('focusin', record, true);
        document.addEventListener('focusout', record, true);
      });

      const readFocusOwner = () =>
        page.evaluate(() => {
          const active = document.activeElement;

          if (!(active instanceof Element)) return 'none';
          if (active.matches('input[placeholder="Paste link"]')) {
            return 'url-input';
          }
          if (
            active.matches('[data-plite-editor="true"][contenteditable="true"]')
          ) {
            return 'editor';
          }

          return active.tagName.toLowerCase();
        });

      for (let run = 0; run < 5; run++) {
        await editor.focus();
        await page.evaluate(() => Reflect.set(window, '__linkFocusEvents', []));
        await page.keyboard.press('ControlOrMeta+k');
        await expect(input).toHaveCount(1);
        const focusTrace = [{ owner: await readFocusOwner(), phase: 'mount' }];

        await expect(input).toBeVisible();
        await expect
          .poll(async () => {
            const inputBox = await input.boundingBox();
            const emptyLineBox = await emptyLine.boundingBox();

            if (!inputBox || !emptyLineBox) return false;

            return (
              inputBox.x >= emptyLineBox.x - 1 &&
              inputBox.y >= emptyLineBox.y + emptyLineBox.height - 1
            );
          })
          .toBe(true);
        focusTrace.push({
          owner: await readFocusOwner(),
          phase: 'positioned',
        });
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
          });
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
        });
        focusTrace.push({ owner: await readFocusOwner(), phase: 'settled' });

        await page.keyboard.type('x');
        focusTrace.push({
          owner: await readFocusOwner(),
          phase: 'follow-up-key',
        });
        const focusEvents = await page.evaluate(
          () =>
            Reflect.get(window, '__linkFocusEvents') as Array<{
              event: string;
              owner: string;
              related: string;
            }>
        );

        for (const phase of ['positioned', 'settled', 'follow-up-key']) {
          expect(
            focusTrace.find((entry) => entry.phase === phase)?.owner,
            JSON.stringify({ focusEvents, focusTrace, reducedMotion })
          ).toBe('url-input');
        }
        await expect(input).toHaveValue('x');

        await page.keyboard.press('Tab');
        await expect(page.getByPlaceholder('Text to display')).toBeFocused();
        await page.keyboard.type('label');
        await page.keyboard.press('Shift+Tab');
        await expect(input).toBeFocused();

        await page.keyboard.press('Escape');
        await expect(input).toBeHidden();
        await expect(root).toBeFocused();
        await page.keyboard.type('q');
        await expect(root).toContainText('q');
        await page.keyboard.press('Backspace');
        await editor.assert.selection({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
      }
    }

    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
