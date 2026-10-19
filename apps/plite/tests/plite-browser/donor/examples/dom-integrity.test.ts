import { expect, test } from '@playwright/test';
import {
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';

test('external DOM corruption is repaired from the model without moving selection', async ({
  page,
}) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    const editor = await openExample(page, 'plite/plaintext', {
      ready: { editor: 'visible' },
    });
    const point = { path: [0, 0], offset: 4 };
    const modelText = await editor.get.text();
    const domText = await editor.root.evaluate(
      (root) => root.textContent?.replaceAll('\uFEFF', '') ?? ''
    );

    await editor.selection.collapse(point);
    await editor.root.evaluate((root) => {
      const textHost = root.querySelector<HTMLElement>(
        '[data-editor-node="text"][data-editor-path="0,0"]'
      );

      if (!textHost) throw new Error('Missing first Plite text host');

      const walker = root.ownerDocument.createTreeWalker(
        textHost,
        NodeFilter.SHOW_TEXT
      );
      const text = walker.nextNode() as Text | null;

      if (!text) throw new Error('Missing first Plite text node');

      const wrapper = root.ownerDocument.createElement('span');

      wrapper.dataset.externalWrapper = 'true';
      text.replaceWith(wrapper);
      wrapper.append(text);
      text.replaceData(0, text.length, 'external corruption');
      textHost.setAttribute('data-app-presentation', 'retained');
      textHost.setAttribute('data-editor-presentation', 'retained');
      textHost.setAttribute('data-editor-void', 'true');
      const rogue = root.ownerDocument.createElement('span');

      rogue.dataset.externalRogue = 'true';
      rogue.textContent = 'rogue';
      root.append(rogue);
    });

    await expect
      .poll(() =>
        editor.root.evaluate((root) => ({
          hasRogue: !!root.querySelector('[data-external-rogue="true"]'),
          hasWrapper: !!root.querySelector('[data-external-wrapper="true"]'),
          editorPresentationAttribute: root
            .querySelector('[data-editor-path="0,0"]')
            ?.getAttribute('data-editor-presentation'),
          presentationAttribute: root
            .querySelector('[data-editor-path="0,0"]')
            ?.getAttribute('data-app-presentation'),
          ownedCorruption: root
            .querySelector('[data-editor-path="0,0"]')
            ?.hasAttribute('data-editor-void'),
          text: root.textContent?.replaceAll('\uFEFF', '') ?? '',
        }))
      )
      .toEqual({
        hasRogue: false,
        hasWrapper: false,
        editorPresentationAttribute: 'retained',
        presentationAttribute: 'retained',
        ownedCorruption: false,
        text: domText,
      });
    expect(await editor.get.text()).toBe(modelText);
    await editor.assert.selection({
      anchor: point,
      focus: point,
    });
    await expect
      .poll(() =>
        editor.root.evaluate((root) => {
          const selection = root.ownerDocument.getSelection();

          return {
            inside:
              !!selection?.anchorNode && root.contains(selection.anchorNode),
            offset: selection?.anchorOffset ?? null,
            path:
              selection?.anchorNode?.parentElement
                ?.closest('[data-editor-path]')
                ?.getAttribute('data-editor-path') ?? null,
          };
        })
      )
      .toEqual({ inside: true, offset: point.offset, path: '0,0' });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
