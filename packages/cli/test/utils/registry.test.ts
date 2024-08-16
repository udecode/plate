/* eslint-disable unicorn/no-await-expression-member */
import { expect, test } from 'vitest';

import { resolveTree } from '../../src/utils/registry';

test('resolve tree', async () => {
  const index = [
    {
      dependencies: ['@radix-ui/react-slot'],
      files: ['button.tsx'],
      name: 'button',
      type: 'components:plate-ui',
    },
    {
      dependencies: ['@radix-ui/react-dialog'],
      files: ['dialog.tsx'],
      name: 'dialog',
      registryDependencies: ['button'],
      type: 'components:plate-ui',
    },
    {
      files: ['input.tsx'],
      name: 'input',
      registryDependencies: ['button'],
      type: 'components:plate-ui',
    },
    {
      dependencies: ['@radix-ui/react-alert-dialog'],
      files: ['alert-dialog.tsx'],
      name: 'alert-dialog',
      registryDependencies: ['button', 'dialog'],
      type: 'components:plate-ui',
    },
    {
      files: ['example-card.tsx'],
      name: 'example-card',
      registryDependencies: ['button', 'dialog', 'input'],
      type: 'components:component',
    },
  ];

  expect(
    (await resolveTree(index as any, ['button']))
      .map((entry) => entry.name)
      .sort()
  ).toEqual(['button']);

  expect(
    (await resolveTree(index as any, ['dialog']))
      .map((entry) => entry.name)
      .sort()
  ).toEqual(['button', 'dialog']);

  expect(
    (await resolveTree(index as any, ['alert-dialog', 'dialog']))
      .map((entry) => entry.name)
      .sort()
  ).toEqual(['alert-dialog', 'button', 'dialog']);

  expect(
    (await resolveTree(index as any, ['example-card']))
      .map((entry) => entry.name)
      .sort()
  ).toEqual(['button', 'dialog', 'example-card', 'input']);

  expect(
    (await resolveTree(index as any, ['foo'])).map((entry) => entry.name).sort()
  ).toEqual([]);

  expect(
    (await resolveTree(index as any, ['button', 'foo']))
      .map((entry) => entry.name)
      .sort()
  ).toEqual(['button']);
});
