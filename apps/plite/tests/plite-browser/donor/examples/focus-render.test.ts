import { expect, test } from '@playwright/test';

import {
  createBrowserEditorHarness,
  openExample,
} from '@platejs/test/playwright';

for (const label of ['Read-only editor', 'Editable editor']) {
  test(`a click in the ${label.toLowerCase()} keeps its caret through the focus render, so Shift+Left selects from the click`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'desktop click-to-caret proof'
    );

    await openExample(page, 'plite/focus-render');

    const root = page.locator(`[data-editor="true"][aria-label="${label}"]`);
    const editor = createBrowserEditorHarness(page, label, root);
    const afterFrom = await root.evaluate((element) => {
      const text = element.querySelectorAll('[data-editor-string]')[1]
        .firstChild as Text;
      const letter = document.createRange();

      letter.setStart(text, 'Shift+Left then selects fro'.length);
      letter.setEnd(text, 'Shift+Left then selects from'.length);
      const rect = letter.getBoundingClientRect();

      return { x: rect.right - 1, y: rect.top + rect.height / 2 };
    });
    const click = { path: [1, 0], offset: 'Shift+Left then selects from'.length };

    await page.mouse.click(afterFrom.x, afterFrom.y);
    await expect
      .poll(() => editor.get.selection(), 'the click places one caret')
      .toEqual({ anchor: click, focus: click });

    for (let press = 0; press < 3; press++) {
      await page.keyboard.press('Shift+ArrowLeft');
    }

    await expect
      .poll(
        async () => ({
          model: await editor.get.selection(),
          text: await page.evaluate(() => document.getSelection()?.toString()),
        }),
        'Shift+Left selects "rom" from the click'
      )
      .toEqual({
        model: { anchor: click, focus: { path: [1, 0], offset: click.offset - 3 } },
        text: 'rom',
      });
  });
}

test('a double-click then a Shift+click in the read-only editor selects the word, then extends it to the click', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop pointer proof');

  await openExample(page, 'plite/focus-render');

  const label = 'Read-only editor';
  const root = page.locator(`[data-editor="true"][aria-label="${label}"]`);
  const editor = createBrowserEditorHarness(page, label, root);
  const pointAt = (block: number, offset: number) =>
    root.evaluate(
      (element, [index, at]) => {
        const text = element.querySelectorAll('[data-editor-string]')[index]
          .firstChild as Text;
        const letter = document.createRange();

        letter.setStart(text, at - 1);
        letter.setEnd(text, at);
        const rect = letter.getBoundingClientRect();

        return { x: rect.right - 1, y: rect.top + rect.height / 2 };
      },
      [block, offset]
    );
  const word = { start: 'A click '.length, end: 'A click places'.length };
  const inWord = await pointAt(0, word.start + 3);
  const afterFrom = await pointAt(1, 'Shift+Left then selects from'.length);

  await page.mouse.dblclick(inWord.x, inWord.y);
  await expect
    .poll(() => editor.get.selection(), 'the double-click selects "places"')
    .toEqual({
      anchor: { path: [0, 0], offset: word.start },
      focus: { path: [0, 0], offset: word.end },
    });

  await page.keyboard.down('Shift');
  await page.mouse.click(afterFrom.x, afterFrom.y);
  await page.keyboard.up('Shift');

  // Chromium and WebKit extend a double-click's selection by whole words, so
  // their Shift+click also takes the space after "from".
  const extendsByWord = testInfo.project.name !== 'firefox';

  await expect
    .poll(
      () => editor.get.selection(),
      'the Shift+click extends the word to the click'
    )
    .toEqual({
      anchor: { path: [0, 0], offset: word.start },
      focus: {
        path: [1, 0],
        offset: 'Shift+Left then selects from'.length + (extendsByWord ? 1 : 0),
      },
    });
});
