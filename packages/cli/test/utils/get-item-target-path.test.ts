import path from 'path';
import { expect, test } from 'vitest';

import { getConfig } from '../../src/utils/get-config';
import { getItemTargetPath } from '../../src/utils/registry';

test('get item target path', async () => {
  // Full config.
  // eslint-disable-next-line unicorn/prefer-module
  let appDir = path.resolve(__dirname, '../fixtures/config-full');
  expect(
    await getItemTargetPath((await getConfig(appDir))!, {
      type: 'components:plate-ui',
    })
  ).toEqual(path.resolve(appDir, './src/components/plate-ui'));

  // Partial config.
  appDir = path.resolve(__dirname, '../fixtures/config-partial');
  expect(
    await getItemTargetPath((await getConfig(appDir))!, {
      type: 'components:plate-ui',
    })
  ).toEqual(path.resolve(appDir, './components/plate-ui'));

  // Custom plate-ui.
  appDir = path.resolve(__dirname, '../fixtures/config-plate-ui');
  expect(
    await getItemTargetPath((await getConfig(appDir))!, {
      type: 'components:plate-ui',
    })
  ).toEqual(path.resolve(appDir, './src/plate-ui'));

  // Custom ui.
  appDir = path.resolve(__dirname, '../fixtures/config-ui');
  expect(
    await getItemTargetPath((await getConfig(appDir))!, {
      type: 'components:plate-ui',
    })
  ).toEqual(path.resolve(appDir, './src/ui'));
});
