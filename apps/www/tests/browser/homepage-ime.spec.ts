import { writeFileSync } from 'node:fs';

import {
  BROWSER_HANDLE_KEY,
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '@platejs/test/playwright';
import { expect, type Page, test } from '@playwright/test';

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
      await root.evaluate(
        (element, [capturedPhase, key]) => {
          const handle = (
            element as HTMLElement &
              Record<
                string,
                {
                  getModelSelection: () => unknown;
                  getViewSelection: () => unknown;
                  getDOMSelection: () => unknown;
                  getInputState: () => unknown;
                }
              >
          )[key];
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
        },
        [phase, BROWSER_HANDLE_KEY] as const
      )
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

const openEmptyParagraph = async (page: Page) => {
  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-home-preview] [data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'homepage:ime-empty', root);
  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await editor.ime.enableKeyEvents();
  const end = await root.evaluate((element) => {
    const host = [
      ...element.querySelectorAll(
        '[data-editor-path="1"] [data-editor-node="text"]'
      ),
    ].at(-1)!;

    return {
      offset: host.textContent.length,
      path: host.getAttribute('data-editor-path')!.split(',').map(Number),
    };
  });
  await editor.selection.collapse(end);
  await editor.focus();
  await page.keyboard.press('Enter');
  await editor.assert.modelBlockText(2, '');

  return {
    client: await page.context().newCDPSession(page),
    editor,
    host: root.locator('[data-editor-path="2,0"]'),
    root,
  };
};

const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      })
  );

test('keeps the preedit caret at the preedit end in an empty paragraph', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const errors = recordBrowserRuntimeErrors(page);
  const { client, editor, host, root } = await openEmptyParagraph(page);

  try {
    for (const text of ['d', "d'd", "d'd'd"]) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
      await settle(page);
      expect(
        await root.evaluate((element) => {
          const selection = element.ownerDocument.getSelection();

          return {
            offset: selection?.focusOffset,
            text: selection?.focusNode?.textContent,
          };
        })
      ).toEqual({ offset: text.length, text });
    }
    await client.send('Input.insertText', { text: '嘟嘟嘟' });
    await expect(host).toHaveText('嘟嘟嘟');
    await editor.assert.collapsedModelDOMSelection({
      offset: 3,
      path: [2, 0],
      text: '嘟嘟嘟',
    });
    errors.assertNone();
  } finally {
    await client.detach();
    errors.stop();
  }
});

test('keeps an empty paragraph typeable after its composition is cancelled', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const errors = recordBrowserRuntimeErrors(page);
  const { client, editor, host, root } = await openEmptyParagraph(page);
  const block = root.locator(
    '[data-editor-node="element"][data-editor-path="2"]'
  );
  const blockBefore = await block.elementHandle();

  try {
    for (const text of ['d', "d'd"]) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.imeSetComposition', {
      selectionEnd: 0,
      selectionStart: 0,
      text: '',
    });
    expect(
      await block.evaluate((element, before) => {
        const selection = element.ownerDocument.getSelection();

        return {
          bareBreak: [...element.children].some(
            (child) => child.tagName === 'BR'
          ),
          caretInHost: Boolean(
            selection?.focusNode &&
            element
              .querySelector('[data-editor-node="text"]')
              ?.contains(selection.focusNode)
          ),
          lineBreak:
            element.querySelector(
              '[data-editor-node="text"] [data-editor-zero-width="n"] br'
            ) !== null,
          replaced: element !== before,
        };
      }, blockBefore)
    ).toEqual({
      bareBreak: false,
      caretInHost: true,
      lineBreak: true,
      replaced: true,
    });
    await page.keyboard.type('xy');
    await expect(host).toHaveText('xy');
    await editor.assert.collapsedModelDOMSelection({
      offset: 2,
      path: [2, 0],
      text: 'xy',
    });
    errors.assertNone();
  } finally {
    await client.detach();
    errors.stop();
  }
});

test('recomposes in an empty paragraph after its composition is cancelled', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const errors = recordBrowserRuntimeErrors(page);
  const { client, editor, host } = await openEmptyParagraph(page);

  try {
    for (const text of ['d', "d'd", '', 'n', 'ni']) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.insertText', { text: '你' });
    await expect(host).toHaveText('你');
    await editor.assert.collapsedModelDOMSelection({
      offset: 1,
      path: [2, 0],
      text: '你',
    });
    errors.assertNone();
  } finally {
    await client.detach();
    errors.stop();
  }
});

test('keeps mid-text typing at the caret after a composition is cancelled', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const errors = recordBrowserRuntimeErrors(page);
  await page.goto('/', { waitUntil: 'commit' });
  const root = page.locator('[data-home-preview] [data-editor="true"]').first();
  const editor = createBrowserEditorHarness(page, 'homepage:ime-mid', root);
  await editor.ready({
    editor: 'visible',
    text: 'Welcome to the Plate Playground!',
  });
  await editor.ime.enableKeyEvents();
  await editor.selection.collapse({ offset: 7, path: [0, 0] });
  await editor.focus();
  const client = await page.context().newCDPSession(page);
  const blocksBefore = await root.evaluateHandle((element) =>
    ['0', '1'].map((path) =>
      element.querySelector(
        `[data-editor-node="element"][data-editor-path="${path}"]`
      )
    )
  );

  try {
    for (const text of ['d', "d'd", '']) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    expect(
      await root.evaluate(
        (element, before) =>
          ['0', '1'].map(
            (path, index) =>
              element.querySelector(
                `[data-editor-node="element"][data-editor-path="${path}"]`
              ) === before[index]
          ),
        blocksBefore
      )
    ).toEqual([true, true]);
    await page.keyboard.type('xy');
    await editor.assert.modelBlockText(0, 'Welcomexy to the Plate Playground!');
    await editor.assert.collapsedModelDOMSelection({
      offset: 9,
      path: [0, 0],
      text: 'Welcomexy to the Plate Playground!',
    });
    errors.assertNone();
  } finally {
    await client.detach();
    errors.stop();
  }
});
