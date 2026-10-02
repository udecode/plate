import { writeFileSync } from 'node:fs';

import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('keeps homepage paragraph composition beside inline links and the next input', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const errors = recordBrowserRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-home-preview] [data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'homepage:ime-inline', root);
  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await editor.ime.enableKeyEvents();
  await startBrowserNativeEventTrace(root);
  const client = await page.context().newCDPSession(page);
  const transitions: unknown[] = [];
  const capture = async (phase: string) => {
    transitions.push(
      await root.evaluate((element, capturedPhase) => {
        const handle = (
          element as HTMLElement & {
            __pliteBrowserHandle: {
              getModelSelection: () => unknown;
              getViewSelection: () => unknown;
              getDOMSelection: () => unknown;
              getInputState: () => unknown;
            };
          }
        ).__pliteBrowserHandle;
        const native = element.ownerDocument.getSelection();
        return {
          phase: capturedPhase,
          native: {
            anchorOffset: native?.anchorOffset,
            focusOffset: native?.focusOffset,
            text: native?.focusNode?.textContent,
            path: native?.focusNode?.parentElement
              ?.closest('[data-editor-node="text"]')
              ?.getAttribute('data-editor-path'),
            focused: element.ownerDocument.activeElement === element,
          },
          model: handle.getModelSelection(),
          view: handle.getViewSelection(),
          dom: handle.getDOMSelection(),
          input: handle.getInputState(),
        };
      }, phase)
    );
  };

  try {
    for (const path of [
      [1, 0],
      [1, 2],
    ]) {
      const host = root.locator(`[data-editor-path="${path.join(',')}"]`);
      const before = (await host.textContent())!;
      const paragraphBefore = (await editor.get.modelBlockText(1))!;
      const offset = 2;
      await editor.selection.collapse({ path, offset });
      await editor.focus();
      await capture(`setup:${path.join(',')}`);
      const original = await root.evaluateHandle((element) => {
        const node = element.ownerDocument.getSelection()?.focusNode;
        if (!(node instanceof Text)) {
          throw new Error('Missing native text caret');
        }
        return node;
      });
      const readNativeState = () =>
        root.evaluate(
          (element, node) => ({
            connected: node.isConnected,
            focused: element.ownerDocument.activeElement === element,
            sameNode: element.ownerDocument.getSelection()?.focusNode === node,
            text: node.textContent,
          }),
          original
        );

      try {
        for (const text of ['n', 'ni', 'nihao']) {
          await client.send('Input.imeSetComposition', {
            selectionEnd: text.length,
            selectionStart: text.length,
            text,
          });
          await capture(`preedit:${text}`);
          await expect.poll(readNativeState).toEqual({
            connected: true,
            focused: true,
            sameNode: true,
            text: `${before.slice(0, offset)}${text}${before.slice(offset)}`,
          });
          await editor.assert.selection({
            anchor: { path, offset },
            focus: { path, offset },
          });
        }
        const screenshot = info.outputPath(`preedit-${path.join('-')}.png`);
        await page.screenshot({ path: screenshot });
        await capture('after-preedit-capture');
        await expect.poll(readNativeState).toEqual({
          connected: true,
          focused: true,
          sameNode: true,
          text: `${before.slice(0, offset)}nihao${before.slice(offset)}`,
        });
        await info.attach(`preedit-${path.join('-')}`, {
          path: screenshot,
          contentType: 'image/png',
        });
        await client.send('Input.insertText', { text: '你好' });
        await capture('commit');
        await expect(host).toHaveText(
          `${before.slice(0, offset)}你好${before.slice(offset)}`
        );
        await editor.assert.collapsedModelDOMSelection({
          path,
          offset: offset + 2,
          text: `${before.slice(0, offset)}你好${before.slice(offset)}`,
        });
        await page.keyboard.type('!');
        await capture('follow-up');
        await expect(host).toHaveText(
          `${before.slice(0, offset)}你好!${before.slice(offset)}`
        );
        await editor.assert.collapsedModelDOMSelection({
          path,
          offset: offset + 3,
          text: `${before.slice(0, offset)}你好!${before.slice(offset)}`,
        });
        await expect
          .poll(() => editor.get.modelBlockText(1))
          .toBe(
            paragraphBefore.replace(
              before,
              `${before.slice(0, offset)}你好!${before.slice(offset)}`
            )
          );
      } finally {
        await original.dispose();
      }
    }
    errors.assertNone();
  } finally {
    const transitionPath = info.outputPath(
      'homepage-selection-transitions.json'
    );
    writeFileSync(transitionPath, JSON.stringify(transitions, null, 2));
    await info.attach('homepage-selection-transitions', {
      path: transitionPath,
      contentType: 'application/json',
    });
    const eventPath = info.outputPath('homepage-composition-events.json');
    writeFileSync(
      eventPath,
      JSON.stringify(await takeBrowserNativeEventTrace(root), null, 2)
    );
    await info.attach('homepage-composition-events', {
      path: eventPath,
      contentType: 'application/json',
    });
    await client.detach();
    errors.stop();
  }
});
