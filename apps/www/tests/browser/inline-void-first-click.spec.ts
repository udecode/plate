import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const EDITOR_ROOT = '[data-plite-editor="true"][contenteditable="true"]';
const EQUATION_TRIGGER = 'button[aria-label="Edit equation"]';

const focusOutsideEditor = async (page: Page) => {
  await page.getByRole('tab', { name: 'Preview', exact: true }).first().click();
  await expect
    .poll(() =>
      page.evaluate(
        (editorSelector) =>
          !document.activeElement?.closest(editorSelector),
        EDITOR_ROOT
      )
    )
    .toBe(true);
};

const focusDateParagraph = async (page: Page, date: Locator) => {
  const dateNode = date.locator(
    'xpath=ancestor::*[@data-plite-node="element"][1]'
  );
  const precedingText = dateNode.locator(
    'xpath=preceding-sibling::*[@data-plite-node="text"][1]'
  );

  await expect(precedingText).toBeVisible();
  const box = await precedingText.boundingBox();

  expect(box).not.toBeNull();
  await page.mouse.click(
    box!.x + box!.width * 0.7,
    box!.y + box!.height / 2
  );
  await expect
    .poll(() =>
      page.evaluate((editorSelector) => {
        const selection = window.getSelection();

        return {
          activeInEditor: Boolean(
            document.activeElement?.closest(editorSelector)
          ),
          anchorText: selection?.anchorNode?.textContent ?? '',
          collapsed: selection?.isCollapsed ?? false,
        };
      }, EDITOR_ROOT)
    )
    .toMatchObject({
      activeInEditor: true,
      anchorText: expect.stringContaining('Insert dates like'),
      collapsed: true,
    });
};

const clickWithPageMouse = async (page: Page, target: Locator) => {
  const box = await target.boundingBox();

  expect(box).not.toBeNull();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.up();
};

const traceFirstGesture = async (
  page: Page,
  selector: string,
  index = 0
) => {
  await page.evaluate(
    ({ index: targetIndex, selector: targetSelector }) => {
      const target = document.querySelectorAll(targetSelector)[targetIndex];
      const editor = target?.closest('[data-plite-editor="true"]');
      const trace: string[] = [];

      (window as typeof window & { __focusFirstClickTrace?: string[] })
        .__focusFirstClickTrace = trace;

      if (target instanceof Element) {
        trace.push(`expanded:${target.getAttribute('aria-expanded')}`);
        new MutationObserver(() => {
          trace.push(`expanded:${target.getAttribute('aria-expanded')}`);
        }).observe(target, {
          attributeFilter: ['aria-expanded'],
        });
      }

      for (const type of ['pointerdown', 'mousedown', 'click']) {
        document.addEventListener(
          type,
          (event) => {
            if (target && event.composedPath().includes(target)) {
              if (type === 'pointerdown') {
                trace.push(
                  `physical-hit-target:${event.target === target ? 'pass' : 'fail'}`
                );
              }
              trace.push(type);
              if (type === 'click') {
                trace.push(
                  `click-delivery:${event.target === target ? 'pass' : 'fail'}`
                );
              }
            }
          },
          true
        );
      }
      document.addEventListener(
        'focus',
        (event) => {
          if (editor?.contains(event.target as Node)) trace.push('focus');
        },
        true
      );
    },
    { index, selector }
  );
};

const readFirstGesture = (page: Page) =>
  page.evaluate(
    () =>
      (window as typeof window & { __focusFirstClickTrace?: string[] })
        .__focusFirstClickTrace ?? []
  );

const expectCompleteFirstGesture = async (page: Page) => {
  await expect
    .poll(() => readFirstGesture(page))
    .toEqual(expect.arrayContaining(['pointerdown', 'mousedown', 'click']));
  await expect
    .poll(() => readFirstGesture(page))
    .toEqual(
      expect.arrayContaining([
        'physical-hit-target:pass',
        'click-delivery:pass',
      ])
    );
};

test('date opens from the first physical click after a text caret', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const date = page.getByRole('button', {
      name: 'January 15, 2024',
      exact: true,
    });

    await expect(date).toBeVisible();
    await date.scrollIntoViewIfNeeded();
    await focusDateParagraph(page, date);
    await traceFirstGesture(page, '.plite-date button[type="button"]');
    await clickWithPageMouse(page, date);
    const firstClickTrace = await readFirstGesture(page);

    await expectCompleteFirstGesture(page);
    expect(
      await date.getAttribute('aria-expanded'),
      `Date first-click trace: ${firstClickTrace.join('>')}`
    ).toBe('true');
    await expect(page.getByRole('grid')).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('date opens from the first click outside editor focus', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const date = page.getByRole('button', {
      name: 'January 15, 2024',
      exact: true,
    });

    await expect(date).toBeVisible();
    await date.scrollIntoViewIfNeeded();
    await focusOutsideEditor(page);
    await traceFirstGesture(page, '.plite-date button[type="button"]');
    await date.click();

    await expectCompleteFirstGesture(page);
    await expect(page.getByRole('grid')).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('inline equation opens from the first focus-owning click', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const inlineEquation = page.locator(EQUATION_TRIGGER).first();
    const input = page.getByPlaceholder('E = mc^2');

    await expect(inlineEquation).toBeVisible();
    await inlineEquation.scrollIntoViewIfNeeded();
    await focusOutsideEditor(page);
    await traceFirstGesture(page, EQUATION_TRIGGER, 0);
    await inlineEquation.click();
    const firstClickTrace = await readFirstGesture(page);

    expect(firstClickTrace).toEqual(
      expect.arrayContaining([
        'physical-hit-target:pass',
        'pointerdown',
        'mousedown',
      ])
    );
    expect(
      await inlineEquation.getAttribute('aria-expanded'),
      `inline first-click trace: ${firstClickTrace.join('>')}`
    ).toBe('true');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    const originalLatex = await input.inputValue();

    await input.fill('x^2 + y^2');
    await expect(inlineEquation).toHaveAttribute('aria-expanded', 'false');
    await focusOutsideEditor(page);
    await inlineEquation.click();
    await expect(input).toHaveValue('x^2 + y^2');
    await input.fill(originalLatex);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test('block equation remains a one-click control', async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const blockEquation = page.locator(EQUATION_TRIGGER).nth(1);

    await expect(blockEquation).toBeVisible();
    await blockEquation.scrollIntoViewIfNeeded();
    await focusOutsideEditor(page);
    await blockEquation.click();

    await expect(blockEquation).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByPlaceholder(/f\(x\) = \\begin\{cases\}/)
    ).toBeVisible();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
