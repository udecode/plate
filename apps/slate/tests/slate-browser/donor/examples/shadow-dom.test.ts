import { expect, type Locator, type Page, test } from '@playwright/test';
import {
  assertNoIllegalKernelTransitions,
  createSlateBrowserEditorHarness,
  createSlateBrowserTextInsertionGauntlet,
} from '@platejs/browser/playwright';

const focusTextboxEnd = async (textbox: Locator) => {
  await textbox.evaluate((element: Element) => {
    const editable = element as HTMLElement;
    const root = editable.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in root ? root.getSelection() : window.getSelection();
    const range = editable.ownerDocument.createRange();

    editable.focus();
    range.selectNodeContents(editable);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
};

const getShadowNativeSelection = async (textbox: Locator) =>
  textbox.evaluate((element: Element) => {
    const root = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in root
        ? root.getSelection()
        : element.ownerDocument.getSelection();
    const anchorNode = selection?.anchorNode ?? null;
    const focusNode = selection?.focusNode ?? null;

    return {
      anchorOffset: selection?.anchorOffset ?? null,
      anchorText: anchorNode?.textContent ?? null,
      containsAnchor: !!anchorNode && element.contains(anchorNode),
      containsFocus: !!focusNode && element.contains(focusNode),
      focusOffset: selection?.focusOffset ?? null,
      focusText: focusNode?.textContent ?? null,
      isCollapsed: selection?.isCollapsed ?? null,
      text: selection?.toString() ?? null,
    };
  });

const selectEnd = async (
  editor: ReturnType<typeof createSlateBrowserEditorHarness>
) => {
  const selection = {
    anchor: { path: [0, 0], offset: 51 },
    focus: { path: [0, 0], offset: 51 },
  };

  await editor.selection.select(selection);
  await expect.poll(() => editor.selection.get()).toEqual(selection);
};

const waitForShadowBreakSync = async ({
  page,
  textbox,
}: {
  page: Page;
  textbox: Locator;
}) => {
  await expect(textbox.locator('[data-slate-node="element"]')).toHaveCount(2);
  await page.waitForTimeout(100);
  await focusTextboxEnd(textbox);
};

const typeShadowText = async ({
  browserName,
  textbox,
  page,
  projectName,
  text,
}: {
  browserName: string;
  textbox: Locator;
  page: Page;
  projectName: string;
  text: string;
}) => {
  if (projectName === 'mobile') {
    await page.keyboard.type(text, { delay: 50 });
    return;
  }

  if (browserName === 'webkit') {
    await textbox.pressSequentially(text, { delay: 25 });
    return;
  }

  await page.keyboard.insertText(text);
};

test.describe('shadow-dom example', () => {
  test.beforeEach(
    async ({ page }) => await page.goto('/examples/slate/shadow-dom')
  );

  test('renders slate editor inside nested shadow', async ({ page }) => {
    const outerShadow = page.locator('[data-cy="outer-shadow-root"]');
    const innerShadow = outerShadow.locator('> div');

    await expect(innerShadow.getByRole('textbox')).toHaveCount(1);
  });

  test('renders slate editor inside nested shadow and edits content', async ({
    browserName,
    page,
  }, testInfo) => {
    const outerShadow = page.locator('[data-cy="outer-shadow-root"]');
    const innerShadow = outerShadow.locator('> div');
    const textbox = innerShadow.getByRole('textbox');
    const editor = createSlateBrowserEditorHarness(page, 'shadow-dom', textbox);

    // Ensure the textbox is present
    await expect(textbox).toHaveCount(1);

    if (browserName === 'webkit' || testInfo.project.name === 'mobile') {
      await selectEnd(editor);
      await editor.insertText(' Hello, Playwright!');
    } else {
      await textbox.click();
      await focusTextboxEnd(textbox);
      await typeShadowText({
        browserName,
        textbox,
        page,
        projectName: testInfo.project.name,
        text: ' Hello, Playwright!',
      });
    }

    await expect.poll(() => editor.get.text()).toContain('Hello, Playwright!');
    await expect(textbox).toContainText('Hello, Playwright!');
  });

  test('runs generated shadow DOM typing gauntlet without illegal kernel transitions', async ({
    page,
  }, testInfo) => {
    const outerShadow = page.locator('[data-cy="outer-shadow-root"]');
    const innerShadow = outerShadow.locator('> div');
    const textbox = innerShadow.getByRole('textbox');
    await expect(textbox).toHaveCount(1);

    const editor = createSlateBrowserEditorHarness(page, 'shadow-dom', textbox);
    await selectEnd(editor);

    const result = await editor.scenario.run(
      'shadow-dom-generated-typing-gauntlet',
      createSlateBrowserTextInsertionGauntlet({
        insertedText: 'ShadowProof',
        textAfterInsert: 'ShadowProof',
      }),
      {
        metadata: {
          capabilities: ['kernel-trace', 'shadow-dom', 'text-mutation'],
          platform: testInfo.project.name,
          transport: 'semantic-handle',
        },
        tracePath: testInfo.outputPath('shadow-dom-typing-gauntlet.json'),
      }
    );

    assertNoIllegalKernelTransitions(result);
  });

  test('sets the native caret through slate-browser DOM helpers inside shadow DOM', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Mobile semantic-handle proof does not exercise native shadow DOM ranges'
    );
    test.skip(
      browserName === 'webkit',
      'WebKit drops programmatic native ranges inside nested shadow DOM'
    );

    const outerShadow = page.locator('[data-cy="outer-shadow-root"]');
    const innerShadow = outerShadow.locator('> div');
    const textbox = innerShadow.getByRole('textbox');
    const editor = createSlateBrowserEditorHarness(page, 'shadow-dom', textbox);
    const offset = 4;
    const text = ' DOM';

    await expect(textbox).toHaveCount(1);
    await editor.dom.collapseAtTextPath({ path: [0, 0], offset });
    await page.keyboard.insertText(text);

    await expect
      .poll(() => editor.get.text())
      .toBe(`This${text} Editor is rendered within a nested Shadow DOM.`);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: offset + text.length },
      focus: { path: [0, 0], offset: offset + text.length },
    });
  });

  test('keeps shadow DOM ArrowLeft movement model-owned inside the shadow root', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Mobile semantic-handle proof does not exercise native shadow DOM keyboard ranges'
    );

    const outerShadow = page.locator('[data-cy="outer-shadow-root"]');
    const innerShadow = outerShadow.locator('> div');
    const textbox = innerShadow.getByRole('textbox');
    await expect(textbox).toHaveCount(1);

    const editor = createSlateBrowserEditorHarness(page, 'shadow-dom', textbox);
    await selectEnd(editor);
    await editor.press('ArrowLeft');

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 50 },
        focus: { path: [0, 0], offset: 50 },
      });
    await expect
      .poll(() => editor.get.kernelTrace())
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            command: expect.objectContaining({
              axis: 'horizontal',
              kind: 'move-selection',
            }),
            eventFamily: 'keydown',
            movement: expect.objectContaining({
              axis: 'horizontal',
              ownership: 'model-owned',
              reason: 'model-horizontal-inline-void',
            }),
          }),
        ])
      );
  });

  test('deletes RTL text with Backspace inside shadow DOM', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Mobile semantic-handle proof does not exercise native shadow DOM keyboard ranges'
    );
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit shadow DOM selectAll handle does not sync selection for RTL delete proof'
    );

    const outerShadow = page.locator('[data-cy="outer-shadow-root"]');
    const innerShadow = outerShadow.locator('> div');
    const textbox = innerShadow.getByRole('textbox');
    const editor = createSlateBrowserEditorHarness(page, 'shadow-dom', textbox);
    const rtlText = 'שלום';

    await editor.selection.selectAll();
    await editor.deleteFragment();
    await editor.focus();
    await typeShadowText({
      browserName,
      page,
      projectName: testInfo.project.name,
      textbox,
      text: rtlText,
    });
    await editor.assert.text(rtlText);

    await editor.selection.collapse({ path: [0, 0], offset: rtlText.length });
    await expect
      .poll(() => getShadowNativeSelection(textbox))
      .toMatchObject({
        anchorOffset: rtlText.length,
        anchorText: rtlText,
        containsAnchor: true,
        containsFocus: true,
        focusOffset: rtlText.length,
        focusText: rtlText,
        isCollapsed: true,
        text: '',
      });
    await editor.press('Backspace');

    await editor.assert.text('שלו');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: rtlText.length - 1 },
      focus: { path: [0, 0], offset: rtlText.length - 1 },
    });
    await expect
      .poll(() => getShadowNativeSelection(textbox))
      .toMatchObject({
        anchorOffset: rtlText.length - 1,
        anchorText: 'שלו',
        containsAnchor: true,
        containsFocus: true,
        focusOffset: rtlText.length - 1,
        focusText: 'שלו',
        isCollapsed: true,
        text: '',
      });
  });

  test('user can type add a new line in editor inside shadow DOM', async ({
    browserName,
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    const outerShadow = page.locator('[data-cy="outer-shadow-root"]');
    const innerShadow = outerShadow.locator('> div');
    const textbox = innerShadow.getByRole('textbox');
    const editor = createSlateBrowserEditorHarness(page, 'shadow-dom', textbox);

    if (browserName === 'webkit' || testInfo.project.name === 'mobile') {
      await selectEnd(editor);
      await editor.insertBreak();
    } else {
      await textbox.click();
      await focusTextboxEnd(textbox);
      await page.keyboard.press('Enter');
    }
    await waitForShadowBreakSync({ page, textbox });
    if (browserName === 'webkit' || testInfo.project.name === 'mobile') {
      await editor.insertText('New line text');
    } else {
      await typeShadowText({
        browserName,
        textbox,
        page,
        projectName: testInfo.project.name,
        text: 'New line text',
      });
    }

    expect(consoleErrors, 'Console errors occurred').toEqual([]);
    expect(pageErrors, 'Page errors occurred').toEqual([]);

    await expect(textbox).toContainText('New line text');
    await expect.poll(() => editor.get.text()).toContain('New line text');
  });
});
