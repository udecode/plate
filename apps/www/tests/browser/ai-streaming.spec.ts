import { expect, test, type Page } from '@playwright/test';

const canonical = (page: Page) =>
  page.locator('[contenteditable="true"][data-plite-editor]');
const draft = (page: Page) => page.locator('[data-ai-draft]');
const report = async (page: Page) =>
  JSON.parse(await page.locator('[data-ai-proof-report]').innerText());
const click = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true }).click();

const startEdit = async (page: Page) => {
  await click(page, 'Start partial edit');
  const before = await report(page);
  await click(page, 'Receive');
  await expect(draft(page)).toBeVisible();
  // Cross a browser event turn so the DOM integrity observer has processed the
  // nested React commit. A transient render that gets repaired is not a pass.
  await expect(draft(page).locator('ins')).toHaveText('replacement');
  return before;
};

test.beforeEach(async ({ page }) => {
  await page.goto('/blocks/ai-streaming-proof');
  await expect(canonical(page)).toContainText('Before selected after.');
});

test('partial edit retains marks and accepts through the copied menu in one undoable batch', async ({
  page,
}) => {
  const before = await startEdit(page);
  await canonical(page).press('ControlOrMeta+z');
  await expect(draft(page).locator('ins')).toHaveText('replacement');
  await expect(draft(page).locator('strong')).toHaveText('Before ');
  await expect(draft(page).locator('del em')).toHaveText('selected');
  await expect(draft(page).locator('u')).toHaveText(' after.');
  await expect(canonical(page)).toContainText('Untouched tail.');
  const snapshot1 = await report(page);
  expect(snapshot1.value).toEqual(before.value);
  expect(snapshot1.history).toBe(0);
  await click(page, 'Finish');
  await page.getByRole('option', { name: 'Accept', exact: true }).click();
  await expect(draft(page)).toHaveCount(0);
  await expect(canonical(page)).toContainText('Before replacement after.');
  await expect(canonical(page).locator('strong')).toHaveText('Before ');
  await expect(canonical(page).locator('u')).toHaveText(' after.');
  await click(page, 'Undo');
  await expect(canonical(page)).toContainText('Before selected after.');
  const snapshot2 = await report(page);
  expect(snapshot2.value).toEqual(before.value);
  expect(snapshot2.selection).toEqual(before.selection);
  expect(snapshot2.history).toBe(0);
  await click(page, 'Redo');
  await expect(canonical(page)).toContainText('Before replacement after.');
  const snapshot3 = await report(page);
  expect(snapshot3.history).toBe(1);
});

test('discard restores the original visible document without history writes', async ({
  page,
}) => {
  const before = await startEdit(page);
  await click(page, 'Finish');
  await page.getByRole('option', { name: 'Discard', exact: true }).click();
  await expect(draft(page)).toHaveCount(0);
  await expect(canonical(page)).toContainText('Before selected after.');
  await expect(canonical(page).locator('em')).toHaveText('selected');
  await click(page, 'Undo');
  const snapshot4 = await report(page);
  expect(snapshot4.value).toEqual(before.value);
  expect(snapshot4.history).toBe(0);
});

test('comment preview marks only its quote and Reject leaves no comment or history', async ({
  page,
}) => {
  await click(page, 'Preview comment');
  const before = await report(page);
  await expect(draft(page).locator('.plite-comment')).toHaveText('selected');
  await expect(draft(page).locator('strong')).toHaveText('Before ');
  await expect(draft(page).locator('u')).toHaveText(' after.');
  expect(
    before.value.children[0].children.some(
      (node: { comment?: boolean }) => node.comment
    )
  ).toBe(false);
  await click(page, 'Finish');
  await expect(
    page.getByText('Clarify the selected quote.', { exact: true })
  ).toBeVisible();
  await click(page, 'Reject');
  await expect(draft(page)).toHaveCount(0);
  await expect(canonical(page).locator('.plite-comment')).toHaveCount(0);
  await expect(canonical(page)).toContainText('Before selected after.');
  await click(page, 'Undo');
  const snapshot5 = await report(page);
  expect(snapshot5.value).toEqual(before.value);
  expect(snapshot5.history).toBe(0);
});

test('a request error stays visible with Accept disabled and the document unchanged', async ({
  page,
}) => {
  const before = await startEdit(page);
  await click(page, 'Fail request');
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'The AI request failed. Please retry.' })
  ).toBeVisible();
  await expect(
    page.getByRole('option', { name: 'Accept', exact: true })
  ).toHaveAttribute('aria-disabled', 'true');
  const snapshot6 = await report(page);
  expect(snapshot6.value).toEqual(before.value);
  expect(snapshot6.history).toBe(0);
  await page.getByRole('option', { name: 'Discard', exact: true }).click();
  await expect(draft(page)).toHaveCount(0);
  await expect(canonical(page)).toContainText('Before selected after.');
});

test('nested scrolling follows the draft end, respects manual up, and resumes at the end', async ({
  page,
}) => {
  await click(page, 'Constrain editor height');
  await click(page, 'Start partial edit');
  const receive = async (count: number) => {
    await page
      .getByRole('textbox', { name: 'Source', exact: true })
      .fill(
        Array.from(
          { length: count },
          (_, index) => `Paragraph ${index + 1}.`
        ).join('\n\n')
      );
    await click(page, 'Receive');
    await expect(draft(page)).toContainText(`Paragraph ${count}.`);
  };
  const bounds = () =>
    page.evaluate(() => {
      const container = document.querySelector<HTMLElement>('.h-96')!;
      const draftElement =
        document.querySelector<HTMLElement>('[data-ai-draft]')!;
      return {
        bottom: container.getBoundingClientRect().bottom,
        end: draftElement.getBoundingClientRect().bottom,
        top: container.scrollTop,
      };
    });
  await receive(30);
  await receive(35);
  await expect
    .poll(async () => {
      const value = await bounds();
      return Math.abs(value.end - value.bottom);
    })
    .toBeLessThan(2);
  await page.locator('.h-96').hover();
  await page.mouse.wheel(0, -300);
  await expect
    .poll(async () => {
      const value = await bounds();
      return value.end - value.bottom;
    })
    .toBeGreaterThan(100);
  const before = await bounds();
  await receive(40);
  const after = await bounds();
  expect(after.top).toBe(before.top);
  expect(after.end).toBeGreaterThan(after.bottom + 100);
  await page.locator('.h-96').hover();
  await page.mouse.wheel(0, 450);
  await expect
    .poll(async () => {
      const value = await bounds();
      return value.end - value.bottom;
    })
    .toBeLessThan(80);
  await receive(45);
  await expect
    .poll(async () => {
      const value = await bounds();
      return Math.abs(value.end - value.bottom);
    })
    .toBeLessThan(2);
});
