import { expect, test } from '@playwright/test';

import { recordPliteBrowserRuntimeErrors } from '../../packages/test/src/playwright/runtime-errors';

test('strict recorder captures browser console and page errors and cleans up', async ({
  page,
}) => {
  const recorder = recordPliteBrowserRuntimeErrors(page, { strict: true });
  await page.setContent('<p>Runtime error capture</p>');
  await page.evaluate(() => {
    console.error('unclassified console error');
    setTimeout(() => {
      throw new Error('uncaught browser error');
    }, 0);
  });
  await expect.poll(() => recorder.errors.length).toBe(2);
  expect(recorder.errors[0]).toContain('unclassified console error');
  expect(recorder.errors[1]).toContain('uncaught browser error');
  recorder.reset();
  recorder.assertNone();
  recorder.stop();
  await page.evaluate(() => console.error('after cleanup'));
  recorder.assertNone();
});
