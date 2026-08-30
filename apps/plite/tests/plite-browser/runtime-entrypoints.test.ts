import { expect, test } from '@playwright/test';

import { getPublicEntrypointRuntimeRows } from '../../../../tooling/entrypoints/entrypoint-dag.mjs';

const expectedClientEntrypointCount = getPublicEntrypointRuntimeRows().filter(
  (row) => row.runtime === 'client'
).length;

test('executes every client entrypoint in a browser DOM', async ({ page }) => {
  await page.goto('/runtime-entrypoints');

  const proof = page.locator('[data-runtime-entrypoint-proof]');

  await expect(proof).toHaveAttribute(
    'data-runtime-entrypoint-proof',
    'passed'
  );
  await expect(proof).toHaveAttribute(
    'data-entrypoint-count',
    String(expectedClientEntrypointCount)
  );
});
