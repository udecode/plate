import path from 'path';
import { expect, test } from 'vitest';

import { getConfig, getRawConfig } from '../../src/utils/get-config';

test('get raw config', async () => {
  expect(
    await getRawConfig(path.resolve(__dirname, '../fixtures/config-none'))
  ).toEqual(null);

  expect(
    await getRawConfig(path.resolve(__dirname, '../fixtures/config-partial'))
  ).toEqual({
    style: 'default',
    tailwind: {
      config: './tailwind.config.ts',
      css: './src/assets/css/tailwind.css',
      baseColor: 'neutral',
      cssVariables: false,
    },
    rsc: false,
    aliases: {
      components: '@/components',
    },
  });

  expect(
    getRawConfig(path.resolve(__dirname, '../fixtures/config-invalid'))
  ).rejects.toThrowError();
});

test('get config', async () => {
  expect(
    await getConfig(path.resolve(__dirname, '../fixtures/config-none'))
  ).toEqual(null);

  expect(
    getConfig(path.resolve(__dirname, '../fixtures/config-invalid'))
  ).rejects.toThrowError();

  expect(
    await getConfig(path.resolve(__dirname, '../fixtures/config-partial'))
  ).toEqual({
    style: 'default',
    tailwind: {
      config: './tailwind.config.ts',
      css: './src/assets/css/tailwind.css',
      baseColor: 'neutral',
      cssVariables: false,
    },
    rsc: false,
    aliases: {
      components: '@/components',
    },
    resolvedPaths: {
      tailwindConfig: path.resolve(
        __dirname,
        '../fixtures/config-partial',
        'tailwind.config.ts'
      ),
      tailwindCss: path.resolve(
        __dirname,
        '../fixtures/config-partial',
        './src/assets/css/tailwind.css'
      ),
      components: path.resolve(
        __dirname,
        '../fixtures/config-partial',
        './components'
      ),
      ui: path.resolve(__dirname, '../fixtures/config-partial', './components'),
      'plate-ui': path.resolve(
        __dirname,
        '../fixtures/config-partial',
        './components'
      ),
    },
  });

  expect(
    await getConfig(path.resolve(__dirname, '../fixtures/config-full'))
  ).toEqual({
    style: 'new-york',
    rsc: false,
    tailwind: {
      config: 'tailwind.config.ts',
      baseColor: 'zinc',
      css: 'src/app/globals.css',
      cssVariables: true,
      prefix: 'tw-',
    },
    aliases: {
      components: '~/components',
    },
    resolvedPaths: {
      tailwindConfig: path.resolve(
        __dirname,
        '../fixtures/config-full',
        'tailwind.config.ts'
      ),
      tailwindCss: path.resolve(
        __dirname,
        '../fixtures/config-full',
        './src/app/globals.css'
      ),
      components: path.resolve(
        __dirname,
        '../fixtures/config-full',
        './src/components'
      ),
      ui: path.resolve(
        __dirname,
        '../fixtures/config-full',
        './src/components'
      ),
      'plate-ui': path.resolve(
        __dirname,
        '../fixtures/config-full',
        './src/components'
      ),
    },
  });
});
