import { expect, type Locator, type Page, test } from '@playwright/test';
import { createPliteBrowserEditorHarness, recordPliteBrowserRuntimeErrors } from '@platejs/test/playwright';
import { createEditor, type DocumentChange, type JsonEditorValue } from 'plitejs';

const original = 'One canonical text.\nEdit either view.\nUndo is shared.';
const primary = (page: Page) => page.locator('#external-text-primary');
const input = (page: Page) => primary(page).getByRole('textbox', { name: 'External text', exact: true });
const harness = (page: Page) => createPliteBrowserEditorHarness(page, 'external-text-primary', primary(page));
type Metrics = { callbackFailures: number; destroyedViews: number; mountedViews: number; patches: number; resets: number; viewCount: number };
type Handle = {
  applyChange: (change: ReturnType<DocumentChange['toJSON']>, policy: { tags: string[] }) => void;
  getExternalTextMetrics: () => Metrics;
};
const metrics = (page: Page) => primary(page).evaluate((element) => (element as HTMLElement & { __pliteBrowserHandle: Handle }).__pliteBrowserHandle.getExternalTextMetrics());
const select = async (target: Locator, anchor: number, focus = anchor) => {
  await target.evaluate((element: HTMLTextAreaElement, range) => {
    element.focus();
    element.setSelectionRange(Math.min(range.anchor, range.focus), Math.max(range.anchor, range.focus), range.anchor > range.focus ? 'backward' : 'forward');
    element.dispatchEvent(new Event('select', { bubbles: true }));
  }, { anchor, focus });
};
const expectText = async (page: Page, text: string) => {
  await expect(input(page)).toHaveValue(text);
  await expect.poll(() => harness(page).get.modelBlockText(1)).toBe(text);
  await expect(page.locator('#external-text-native [data-plite-path="1"]')).toHaveText(text);
};
const applyPeerUpdate = async (page: Page, update: (peer: ReturnType<typeof createEditor>) => void) => {
  const value = await harness(page).get.modelValue() as JsonEditorValue;
  const peer = createEditor({ initialValue: value });
  update(peer);
  const change = peer.read.lastCommit()!.changes.toJSON();
  await primary(page).evaluate((element, payload) => (element as HTMLElement & { __pliteBrowserHandle: Handle }).__pliteBrowserHandle.applyChange(payload, { tags: ['remote'] }), change);
};
const applyRemote = (page: Page, offset: number, text: string) => applyPeerUpdate(page, (peer) => peer.update.text.insert(text, { at: { path: [1, 0], offset } }));
const compose = (target: Locator, phase: 'start' | 'update' | 'end', text = '') => target.evaluate((element: HTMLTextAreaElement, payload) => {
  if (payload.phase === 'start') element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
  else if (payload.phase === 'update') {
    element.value = payload.text;
    element.setSelectionRange(payload.text.length, payload.text.length);
    element.dispatchEvent(new CompositionEvent('compositionupdate', { bubbles: true, data: payload.text }));
    element.dispatchEvent(new InputEvent('input', { bubbles: true, data: payload.text, inputType: 'insertCompositionText', isComposing: true }));
  } else element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: payload.text }));
}, { phase, text });

test.describe('external text', () => {
  let errors: ReturnType<typeof recordPliteBrowserRuntimeErrors>;
  test.beforeEach(async ({ page }) => {
    errors = recordPliteBrowserRuntimeErrors(page);
    await page.goto('/examples/plite/external-text', { waitUntil: 'domcontentloaded' });
    await expect(input(page)).toHaveValue(original);
  });
  test.afterEach(async ({ page }) => {
    try {
      errors.assertNone();
      expect((await metrics(page)).callbackFailures).toBe(0);
    } finally { errors.stop(); }
  });

  test('external-text-local-input: one canonical commit per native insert, delete, and newline', async ({ page }) => {
    const target = input(page);
    await select(target, 4);
    const version = Number(await target.getAttribute('data-version'));
    await target.press('x');
    await expectText(page, 'One xcanonical text.\nEdit either view.\nUndo is shared.');
    expect(Number(await target.getAttribute('data-version'))).toBe(version + 1);
    await target.press('Backspace');
    await expectText(page, original);
    await target.press('Enter');
    await expectText(page, 'One \ncanonical text.\nEdit either view.\nUndo is shared.');
    await expect(page.getByTestId('external-text-outer-events')).toHaveText('0');
    expect((await metrics(page)).resets).toBe(0);
  });

  test('external-text-selection-direction: backward native range and sibling model projection', async ({ page }) => {
    await page.getByLabel('Second external view').check();
    await select(input(page), 8);
    await input(page).press('Shift+ArrowLeft');
    await input(page).press('Shift+ArrowLeft');
    await expect.poll(() => harness(page).selection.get()).toEqual({ anchor: { path: [1, 0], offset: 8 }, focus: { path: [1, 0], offset: 6 } });
    await expect(input(page)).toHaveAttribute('data-selection-mode', 'native');
    await expect(page.locator('#external-text-secondary textarea')).toHaveAttribute('data-selection-mode', 'model');
    const native = await input(page).evaluate((element: HTMLTextAreaElement) => ({ start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection }));
    expect(native).toEqual({ start: 6, end: 8, direction: 'backward' });
  });

  for (const direction of ['backward', 'forward'] as const) {
    test(`external-text-boundary-navigation: ${direction} arrow and follow-up typing`, async ({ page }) => {
      const backward = direction === 'backward';
      await select(input(page), backward ? 0 : original.length);
      await input(page).press(backward ? 'ArrowLeft' : 'ArrowRight');
      await expect(primary(page)).toBeFocused();
      await expect.poll(() => harness(page).selection.get()).toEqual({
        anchor: { path: [backward ? 0 : 2, 0], offset: backward ? 25 : 0 },
        focus: { path: [backward ? 0 : 2, 0], offset: backward ? 25 : 0 },
      });
      await page.keyboard.type('!');
      await expect.poll(() => harness(page).get.modelBlockText(backward ? 0 : 2)).toBe(backward ? 'Before the external view.!' : '!After the external view.');
    });
    test(`external-text-boundary-navigation: ${direction} shift-arrow keeps a model range across the host`, async ({ page }) => {
      const backward = direction === 'backward';
      await select(input(page), backward ? 0 : original.length);
      await input(page).press(backward ? 'Shift+ArrowLeft' : 'Shift+ArrowRight');
      await expect.poll(() => harness(page).selection.get()).toEqual({
        anchor: { path: [1, 0], offset: backward ? 0 : original.length },
        focus: { path: [backward ? 0 : 2, 0], offset: backward ? 25 : 0 },
      });
      await expect(input(page)).toHaveAttribute('data-selection-mode', 'model');
    });
    test(`external-text-boundary-navigation: ${direction} deletion keeps follow-up native input usable`, async ({ page }) => {
      const backward = direction === 'backward';
      await select(input(page), backward ? 0 : original.length);
      await input(page).press(backward ? 'Backspace' : 'Delete');
      const block = backward ? 0 : 1;
      const offset = backward ? 25 : original.length;
      await expect.poll(() => harness(page).selection.get()).toEqual({
        anchor: { path: [block, 0], offset }, focus: { path: [block, 0], offset },
      });
      await expect(backward ? primary(page) : input(page)).toBeFocused();
      await page.keyboard.type('!');
      await expect.poll(() => harness(page).get.modelBlockText(block)).toBe(backward
        ? 'Before the external view.!' + original : original + '!After the external view.');
    });
  }

  test('external-text-composition: synthetic browser event ordering forms one history epoch', async ({ page }) => {
    await input(page).fill('');
    await expectText(page, '');
    const before = await harness(page).get.history() as { undos: unknown[] };
    await compose(input(page), 'start');
    await compose(input(page), 'update', 'a');
    await compose(input(page), 'update', 'あ');
    await compose(input(page), 'end', 'あ');
    await expectText(page, 'あ');
    expect((await harness(page).get.history() as { undos: unknown[] }).undos).toHaveLength(before.undos.length + 1);
    await input(page).press('!');
    await input(page).press('ControlOrMeta+Z');
    await expectText(page, 'あ');
    await input(page).press('ControlOrMeta+Z');
    await expectText(page, '');
    await expect(page.getByTestId('external-text-outer-events')).toHaveText('0');
  });

  test('external-text-clipboard: native local copy, cut, and paste have one owner', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'Native clipboard shortcuts are a desktop-browser claim.');
    const target = input(page);
    const local = createPliteBrowserEditorHarness(page, 'external-text-input-clipboard', target);
    await select(target, 4, 13);
    const copy = await local.clipboard.copyNativeEventPayload();
    expect(copy.text).toBe('canonical');
    const cut = await local.clipboard.cutNativeEventPayload();
    expect(cut.text).toBe('canonical');
    await expectText(page, original.replace('canonical', ''));
    await local.clipboard.pasteNativeText(copy.text);
    await expectText(page, original);
    await expect(page.getByTestId('external-text-outer-events')).toHaveText('0');
  });

  test('external-text-clipboard: model-owned cross-boundary copy includes absent canonical text', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'Native clipboard shortcuts are a desktop-browser claim.');
    const outer = harness(page);
    await outer.selection.select({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [1, 0], offset: 13 } });
    const payload = await outer.clipboard.copyNativeEventPayload();
    expect(payload.text).toBe('Before the external view.\nOne canonical');
    expect(payload.pliteFragment).toBeTruthy();
    expect((await outer.clipboard.cutNativeEventPayload()).text).toBe(payload.text);
    expect((await outer.get.modelBlockTexts()).join('\n')).not.toContain('One canonical');
    await expect.poll(() => outer.selection.get()).toEqual({
      anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 },
    });
    await expect(input(page)).toHaveValue(original.slice(13));
    await expect(input(page)).toBeFocused();
    expect(await input(page).evaluate((element: HTMLTextAreaElement) => [element.selectionStart, element.selectionEnd])).toEqual([0, 0]);
    await outer.undo();
    await expectText(page, original);
  });

  test('external-text-drop: synthetic text drop inserts once inside the host', async ({ page }) => {
    await select(input(page), 4);
    await input(page).evaluate((element) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', 'DROP');
      element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
    });
    await expectText(page, original.slice(0, 4) + 'DROP' + original.slice(4));
    await input(page).press('!');
    await expectText(page, original.slice(0, 4) + 'DROP!' + original.slice(4));
    await expect(page.getByTestId('external-text-outer-events')).toHaveText('0');
  });

  test('external-text-drop: plain text leaving the host is copied without deleting its source', async ({ page }) => {
    await select(input(page), 4, 13);
    await primary(page).evaluate((element) => {
      const source = element.querySelector('textarea')!;
      const target = element.querySelector('[data-plite-path="0"]')!;
      const text = element.ownerDocument.createTreeWalker(target, NodeFilter.SHOW_TEXT).nextNode()!;
      const range = element.ownerDocument.createRange();
      range.setStart(text, 3);
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', source.value.slice(source.selectionStart, source.selectionEnd));
      source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
      target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, clientX: rect.left, clientY: rect.top + rect.height / 2, dataTransfer }));
      source.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer }));
    });
    await expectText(page, original);
    await expect.poll(() => harness(page).get.modelBlockText(0)).toBe('Befcanonicalore the external view.');
    await expect(primary(page)).toBeFocused();
    await page.keyboard.press('!');
    await expect.poll(() => harness(page).get.modelBlockText(0)).toBe('Befcanonical!ore the external view.');
    await expectText(page, original);
  });

  test('external-text-history-replay: native undo and redo preserve text and focus', async ({ page }) => {
    await select(input(page), original.length);
    await input(page).press('!');
    await expectText(page, original + '!');
    await input(page).press('ControlOrMeta+Z');
    await expectText(page, original);
    await expect(input(page)).toBeFocused();
    await input(page).press('ControlOrMeta+Shift+Z');
    await expectText(page, original + '!');
    await expect(input(page)).toBeFocused();
    expect((await metrics(page)).resets).toBe(0);
  });

  test('external-text-remote: second-editor changes map a backward selection without reset', async ({ page }) => {
    await select(input(page), 13, 4);
    await applyRemote(page, 0, 'R');
    await expectText(page, 'R' + original);
    await expect.poll(() => harness(page).selection.get()).toEqual({ anchor: { path: [1, 0], offset: 14 }, focus: { path: [1, 0], offset: 5 } });
    await applyRemote(page, 8, 'S');
    await applyRemote(page, original.length + 2, 'T');
    await expectText(page, ('R' + original).slice(0, 8) + 'S' + ('R' + original).slice(8) + 'T');
    expect((await metrics(page)).resets).toBe(0);
  });

  test('external-text-remote-composition: remote conflict resets once and rejects late composition input', async ({ page }) => {
    await select(input(page), 0);
    await compose(input(page), 'start');
    await applyRemote(page, 0, 'R');
    await expectText(page, 'R' + original);
    expect((await metrics(page)).resets).toBe(1);
    await compose(input(page), 'update', 'late');
    await expectText(page, 'R' + original);
    await compose(input(page), 'end');
    await input(page).press('!');
    expect(await harness(page).get.modelBlockText(1)).toContain('!');
  });

  test('external-text-multiple-views: focus transfers without stealing selection or duplicating text', async ({ page }) => {
    await page.getByLabel('Second external view').check();
    const secondary = page.locator('#external-text-secondary textarea');
    await select(input(page), 4);
    await input(page).press('!');
    await expect(secondary).toHaveValue(original.slice(0, 4) + '!' + original.slice(4));
    await select(secondary, 0);
    await secondary.press('?');
    await expectText(page, '?' + original.slice(0, 4) + '!' + original.slice(4));
    await expect(secondary).toBeFocused();
    await expect(secondary).toHaveAttribute('data-selection-mode', 'native');
    await expect(input(page)).toHaveAttribute('data-selection-mode', 'model');
    await page.getByLabel('Second external view').uncheck();
    await select(input(page), 0);
    await input(page).press('x');
    expect((await metrics(page)).viewCount).toBe(1);
  });

  test('external-text-lifecycle: named roots and read-only updates preserve canonical text', async ({ page }) => {
    await input(page).fill('saved main');
    await page.getByRole('combobox', { name: 'View root' }).selectOption('notes');
    await expect(input(page)).toHaveValue('An independently addressed note.');
    await input(page).fill('saved note');
    await page.getByLabel('Read-only', { exact: true }).check();
    await expect(input(page)).toHaveAttribute('readonly', '');
    await input(page).focus();
    await input(page).press('x');
    await expect(input(page)).toHaveValue('saved note');
    await page.getByLabel('Read-only', { exact: true }).uncheck();
    await page.getByRole('combobox', { name: 'View root' }).selectOption('document');
    await expectText(page, 'saved main');
    await page.getByRole('combobox', { name: 'View root' }).selectOption('notes');
    await expect(input(page)).toHaveValue('saved note');
    expect((await metrics(page)).viewCount).toBe(1);
  });

  test('external-text-lifecycle: moving, replacing, and removing content preserves host ownership', async ({ page }) => {
    await select(input(page), 4);
    const initial = await metrics(page);
    await applyPeerUpdate(page, (peer) => peer.update.nodes.move({ at: [1], to: [0] }));
    await expect(input(page)).toHaveValue(original);
    await expect(input(page)).toBeFocused();
    await expect.poll(() => harness(page).selection.get()).toEqual({ anchor: { path: [0, 0], offset: 4 }, focus: { path: [0, 0], offset: 4 } });
    expect((await metrics(page)).mountedViews).toBe(initial.mountedViews);
    expect((await metrics(page)).destroyedViews).toBe(initial.destroyedViews);
    await input(page).press('!');
    await expect.poll(() => harness(page).get.modelBlockText(0)).toBe(original.slice(0, 4) + '!' + original.slice(4));
    await applyPeerUpdate(page, (peer) => peer.update((tx) => {
      tx.nodes.remove({ at: [0, 0] });
      tx.nodes.insert({ text: 'Replacement' }, { at: [0, 0] });
    }));
    await expect(input(page)).toHaveValue('Replacement');
    expect((await metrics(page)).resets).toBe(initial.resets + 1);
    await applyPeerUpdate(page, (peer) => peer.update.nodes.remove({ at: [0] }));
    await expect(input(page)).toHaveCount(0);
    expect((await metrics(page)).viewCount).toBe(0);
    expect((await metrics(page)).destroyedViews).toBe(initial.destroyedViews + 1);
    await harness(page).selection.select({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } });
    await primary(page).press('!');
    await expect.poll(() => harness(page).get.modelBlockText(0)).toBe('!Before the external view.');
  });

  test('external-text-hydration: server host is empty and client mount has no duplicate canonical DOM', async ({ page, request }) => {
    const response = await request.get('/examples/plite/external-text');
    const html = await response.text();
    expect(html).toContain('data-plite-external-text');
    expect(html).not.toContain('<textarea');
    await expect(primary(page).locator('[data-plite-path="1,0"]')).toHaveCount(0);
    await expect(primary(page).locator('textarea')).toHaveCount(1);
    const counts = await metrics(page);
    expect(counts.mountedViews - counts.destroyedViews).toBe(1);
  });

  test('external-text-decorations: source refresh delivers keyed ranges without duplicate canonical DOM', async ({ page }) => {
    await page.getByLabel('Show decorations').check();
    await expect(input(page)).toHaveAttribute('data-decorations', '2');
    await expect(primary(page).locator('[data-plite-external-text] [data-example-decoration]')).toHaveCount(0);
    await expect(primary(page).locator('[data-plite-path="1,0"]')).toHaveCount(0);
    await page.getByLabel('Show decorations').uncheck();
    await expect(input(page)).toHaveAttribute('data-decorations', '0');
    expect((await metrics(page)).resets).toBe(0);
  });

  test('external-text-a11y: one labelled native textbox and keyboard entry', async ({ page }) => {
    const host = primary(page).locator('[data-plite-external-text]');
    await expect(host.getByRole('textbox', { name: 'External text', exact: true })).toHaveCount(1);
    await expect(host).toMatchAriaSnapshot(`- group "External text":\n  - textbox "External text"`);
    await page.getByRole('combobox', { name: 'View root' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#external-text-native')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(primary(page)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(input(page)).toBeFocused();
  });

  test('external-text-follow-up: outer native typing and copy resume after leaving the host', async ({ page }, info) => {
    await select(input(page), original.length);
    await input(page).press('ArrowRight');
    await page.keyboard.type('Follow-up ');
    const outer = harness(page);
    await expect.poll(() => outer.get.modelBlockText(2)).toBe('Follow-up After the external view.');
    if (info.project.name !== 'mobile') {
      await outer.selection.select({ anchor: { path: [2, 0], offset: 0 }, focus: { path: [2, 0], offset: 9 } });
      const payload = await outer.clipboard.copyNativeEventPayload();
      expect(payload.text).toBe('Follow-up');
    }
  });
});
