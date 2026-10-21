import {
  BROWSER_HANDLE_KEY,
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const LABEL = 'Suggestion projection document';

for (const { end, shown, view } of [
  {
    end: { path: [1, 0], offset: 27 },
    shown: 'We ship on Friday.\nThis extra sentence can go.',
    view: 'Accepted',
  },
  {
    end: { path: [1, 0], offset: 21 },
    shown: 'We ship the update on Friday.\nThis sentence can go.',
    view: 'Proposed',
  },
  {
    end: { path: [1, 2], offset: 16 },
    shown: 'We ship the update on Friday.\nThis extra sentence can go.',
    view: 'Markup',
  },
]) {
  test(`a click after "go." in the ${view} view and Shift+Left three times select "go." and edit nothing [plate#5195]`, async ({
    page,
  }) => {
    const errors = recordBrowserRuntimeErrors(page, { strict: true });

    await page.goto('/docs/suggestion', { waitUntil: 'commit' });
    const root = page.locator(`[data-editor="true"][aria-label="${LABEL}"]`);
    const editor = createBrowserEditorHarness(page, LABEL, root);

    await root.waitFor();
    await page
      .getByRole('group', { name: 'Document projection' })
      .getByRole('radio', { name: view })
      .click();
    await expect(root).toHaveText(shown.replace('\n', ''));
    const stored = await editor.get.modelValue();
    const afterGo = await root.evaluate((element) => {
      const blocks = [
        ...element.querySelectorAll('[data-editor-node="element"]'),
      ].filter(
        (block) => !block.parentElement?.closest('[data-editor-node="element"]')
      );
      const text = [...blocks[1].querySelectorAll('[data-editor-string]')].at(
        -1
      )!.firstChild as Text;
      const period = document.createRange();

      blocks[1].scrollIntoView({ block: 'center' });

      period.setStart(text, text.length - 1);
      period.setEnd(text, text.length);
      const rect = period.getBoundingClientRect();

      return { x: rect.right - 1, y: rect.top + rect.height / 2 };
    });
    const selections = async () => ({
      dom: await root.evaluate(
        (element, key) =>
          (
            element as unknown as Record<
              string,
              { getDOMSelection?: () => unknown }
            >
          )[key]?.getDOMSelection?.() ?? null,
        BROWSER_HANDLE_KEY
      ),
      model: await editor.get.selection(),
      text: await page.evaluate(() => document.getSelection()?.toString()),
    });
    const caret = { anchor: end, focus: end };
    const go = {
      anchor: end,
      focus: { path: end.path, offset: end.offset - 3 },
    };

    await page.mouse.click(afterGo.x, afterGo.y);
    await expect
      .poll(selections, 'the click places one caret after "go."')
      .toMatchObject({ dom: caret, model: caret, text: '' });
    for (let press = 0; press < 3; press++) {
      await page.keyboard.press('Shift+ArrowLeft');
    }
    await expect
      .poll(selections, 'Shift+Left selects the visible "go."')
      .toMatchObject({ dom: go, model: go, text: 'go.' });

    await page.keyboard.press('X');
    await page.keyboard.press('Backspace');
    await expect
      .poll(() => root.innerText(), 'the read-only view takes no typing')
      .toBe(shown);
    expect(await editor.get.modelValue()).toEqual(stored);
    errors.assertNone();
  });
}
