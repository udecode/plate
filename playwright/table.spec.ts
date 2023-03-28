import { test, expect } from '@playwright/test';

const getCell = (page: Locator, row: number, column: number) => page.locator(`table > tbody > tr:nth-child(${row}) > :nth-child(${column})`);
const getWidth = (locator: Locator) => locator.boundingBox().then((box) => box.width);
const getHeight = (locator: Locator) => locator.boundingBox().then((box) => box.height);

const getResizableWrapper = (cell: Locator) => cell.locator('[class*=\'ResizableWrapper\']');
const getRightResizable = (cell: Locator) => getResizableWrapper(cell).locator(':nth-child(1)');
const getBottomResizable = (cell: Locator) => getResizableWrapper(cell).locator(':nth-child(2)');
const getLeftResizable = (cell: Locator) => getResizableWrapper(cell).locator(':nth-child(3)');

const dragResizable = async (page: Page, resizable: Locator, dx: number, dy: number) => {
  const resizableBoundingBox = await resizable.boundingBox();

  const resizableCenter = {
    x: resizableBoundingBox.x + resizableBoundingBox.width / 2,
    y: resizableBoundingBox.y + resizableBoundingBox.height / 2,
  };

  await page.mouse.move(resizableCenter.x, resizableCenter.y);
  await page.mouse.down();
  await page.mouse.move(resizableCenter.x + dx, resizableCenter.y + dy);
  await page.mouse.up();
};

test('resize fixed column', async ({ page }) => {
  await page.goto('http://localhost:3030/table/fixed');

  const rowOneCellOne = await getCell(page, 1, 1);
  const rowOneCellOnePreviousWidth = await getWidth(rowOneCellOne);

  const rowOneCellTwo = await getCell(page, 1, 2);
  const rowOneCellTwoPreviousWidth = await getWidth(rowOneCellTwo);

  const rightResizable = await getRightResizable(rowOneCellOne);
  await dragResizable(page, rightResizable, 13, 0);

  const rowOneCellOneNewWidth = await getWidth(rowOneCellOne);
  const rowOneCellTwoNewWidth = await getWidth(rowOneCellTwo);

  expect(rowOneCellOneNewWidth).toBe(rowOneCellOnePreviousWidth + 13);
  expect(rowOneCellTwoNewWidth).toBe(rowOneCellTwoPreviousWidth - 13);
});

test('resize auto column', async ({ page }) => {
  await page.goto('http://localhost:3030/table/auto');

  const rowOneCellOne = await getCell(page, 1, 1);
  const rowOneCellOnePreviousWidth = await getWidth(rowOneCellOne);

  const rowOneCellTwo = await getCell(page, 1, 2);
  const rowOneCellTwoPreviousWidth = await getWidth(rowOneCellTwo);

  const rightResizable = await getRightResizable(rowOneCellOne);
  await dragResizable(page, rightResizable, 13, 0);

  const rowOneCellOneNewWidth = await getWidth(rowOneCellOne);
  const rowOneCellTwoNewWidth = await getWidth(rowOneCellTwo);

  expect(rowOneCellOneNewWidth).toBe(rowOneCellOnePreviousWidth + 13);
  expect(rowOneCellTwoNewWidth).toBe(rowOneCellTwoPreviousWidth - 13);
});

test('resize row', async ({ page }) => {
  await page.goto('http://localhost:3030/table/fixed');

  const rowOneCellOne = await getCell(page, 1, 1);
  const rowOneCellOnePreviousHeight = await getHeight(rowOneCellOne);

  const bottomResizable = await getBottomResizable(rowOneCellOne);
  await dragResizable(page, bottomResizable, 0, 13);

  const rowOneCellOneNewHeight = await getHeight(rowOneCellOne);

  // Height is off by < 1px in Chromium and Firefox
  expect(rowOneCellOneNewHeight - rowOneCellOnePreviousHeight - 13).toBeLessThan(1);
});
