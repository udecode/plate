import { expect, test } from '@platejs/test/playwright';

test("the document editor reaches a focused view in a same-origin iframe inside another view's editable", async ({
  page,
}) => {
  await page.goto('/dev/view-focus-chain');
  const frameView = page
    .frameLocator('iframe[title="Frame host"]')
    .getByRole('textbox', { name: 'frame view' });

  await frameView.getByText('page text').click();
  await expect(frameView, 'the frame view holds focus').toBeFocused();
  await page.evaluate(() => window.viewFocusChain!.clearCaret());

  expect(await page.evaluate(() => window.viewFocusChain!.reachedView())).toBe(
    'frame view'
  );
});

test('a block dragged from one view resolves its drop target in the view under the pointer, inside a closed shadow root', async ({
  page,
}) => {
  await page.goto('/dev/view-focus-chain');
  const pageView = page.getByRole('textbox', { name: 'page view' });

  await pageView.getByText('page text').first().click();
  await expect(pageView, 'the drag starts in the page view').toBeFocused();
  const center = await page.evaluate(() =>
    window.viewFocusChain!.noteBlockCenter()
  );

  expect(center, 'the note view is mounted').not.toBeNull();
  expect(
    await page.evaluate(
      ({ x, y }) => window.viewFocusChain!.dropAt(x, y),
      center!
    )
  ).toBe('note text');
});
