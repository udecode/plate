import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const CASE_ID = 'block-void:native-caret-not-painted-below-void';
const EDITOR = '[data-plite-editor="true"][contenteditable="true"]';

const afterPaint = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

const readVoidState = (voidNode: Locator) =>
  voidNode.evaluate((element) => {
    const selection = getSelection();
    const spacer = element.querySelector('[data-plite-spacer]');
    const zero = element.querySelector('[data-plite-zero-width]');

    return {
      anchorInVoid: Boolean(
        selection?.anchorNode && element.contains(selection.anchorNode)
      ),
      caretColor: spacer ? getComputedStyle(spacer).caretColor : null,
      hasBreak: Boolean(zero?.querySelector('br')),
      selected:
        element.querySelector('[data-selected="true"]') !== null ||
        element.querySelector('.ring-2') !== null ||
        element.getAttribute('data-selected') === 'true',
      zeroWidthKind: zero?.getAttribute('data-plite-zero-width'),
    };
  });

const readBlockEquationLayout = (equation: Locator) =>
  equation.evaluate((element) => {
    const button = element.querySelector('button[aria-label="Edit equation"]');
    const formula = button?.querySelector('.katex');
    const elementRect = element.getBoundingClientRect();
    const buttonRect = button?.getBoundingClientRect();
    const formulaRect = formula?.getBoundingClientRect();

    return {
      buttonCenterDelta: buttonRect
        ? Math.abs(
            (buttonRect.left + buttonRect.right) / 2 -
              (elementRect.left + elementRect.right) / 2
          )
        : Number.POSITIVE_INFINITY,
      buttonWidth: buttonRect?.width ?? 0,
      elementWidth: elementRect.width,
      formulaHeight: formulaRect?.height ?? 0,
      formulaWidth: formulaRect?.width ?? 0,
    };
  });

const expectFullRowCenteredEquation = (
  layout: Awaited<ReturnType<typeof readBlockEquationLayout>>
) => {
  expect(layout.elementWidth).toBeGreaterThan(500);
  expect(
    Math.abs(layout.buttonWidth - layout.elementWidth)
  ).toBeLessThanOrEqual(2);
  expect(layout.buttonCenterDelta).toBeLessThanOrEqual(1);
  expect(layout.formulaWidth).toBeGreaterThan(100);
  expect(layout.formulaWidth).toBeLessThan(250);
  expect(layout.formulaHeight).toBeGreaterThan(30);
};

const clickTextEnd = async (page: Page, text: Locator) => {
  const box = await text.boundingBox();

  expect(box).not.toBeNull();
  await text.click({
    position: {
      x: Math.max(1, (box?.width ?? 1) - 1),
      y: Math.max(1, (box?.height ?? 1) / 2),
    },
  });
  await afterPaint(page);

  await expect
    .poll(() =>
      text.evaluate((element) => {
        const selection = getSelection();
        const anchor = selection?.anchorNode;

        return {
          atEnd:
            selection?.anchorOffset === (anchor?.textContent?.length ?? -1),
          collapsed: selection?.isCollapsed ?? false,
          inside: Boolean(anchor && element.contains(anchor)),
        };
      })
    )
    .toEqual({ atEnd: true, collapsed: true, inside: true });
};

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR).first();
    const editorHarness = createPliteBrowserEditorHarness(
      page,
      CASE_ID,
      editor
    );

    await editorHarness.ready({
      editor: 'visible',
      text: 'Dates and Equations',
    });

    const equation = editor.locator('.plite-equation');

    expectFullRowCenteredEquation(await readBlockEquationLayout(equation));

    const horizontalRule = editor.locator('.plite-horizontalRule');
    await horizontalRule.locator('hr').click();
    await afterPaint(page);

    const horizontalRuleState = await readVoidState(horizontalRule);

    await expect(editor).toBeFocused();
    expect(horizontalRuleState.selected).toBe(true);
    expect(horizontalRuleState.anchorInVoid).toBe(true);
    expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(
      horizontalRuleState.caretColor
    );
    expect(horizontalRuleState.zeroWidthKind).toBe('z');
    expect(horizontalRuleState.hasBreak).toBe(false);

    await page.keyboard.press('Backspace');
    await expect(horizontalRule).toHaveCount(0);
    await expect(editor).toBeFocused();
    await page.keyboard.press('ControlOrMeta+z');
    await expect(horizontalRule).toHaveCount(1);
    await afterPaint(page);

    await equation.getByRole('button', { name: 'Edit equation' }).click();
    await page.getByRole('button', { name: /Done/ }).click();
    await afterPaint(page);

    const equationState = await readVoidState(equation);

    await expect(editor).toBeFocused();
    expect(equationState.selected).toBe(true);
    expect(equationState.anchorInVoid).toBe(false);
    expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(
      equationState.caretColor
    );
    expect(equationState.zeroWidthKind).toBe('z');
    expect(equationState.hasBreak).toBe(false);
    expectFullRowCenteredEquation(await readBlockEquationLayout(equation));

    const calloutHeading = editor
      .locator('h3')
      .filter({ hasText: 'Callouts and Details' })
      .first();
    await clickTextEnd(
      page,
      calloutHeading.locator('[data-plite-string="true"]')
    );
    await expect(editor).toBeFocused();
    await page.keyboard.type('!');
    await expect(calloutHeading).toHaveText('Callouts and Details!');
    await page.keyboard.press('ControlOrMeta+z');
    await expect(calloutHeading).toHaveText('Callouts and Details');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
