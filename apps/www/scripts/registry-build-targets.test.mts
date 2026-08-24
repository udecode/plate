import { describe, expect, it } from 'bun:test';

import { getRegistryBuildTargets } from './registry-build-targets.mts';

describe('registry build targets', () => {
  it('keeps the legacy production registry alongside style variants', () => {
    expect(
      getRegistryBuildTargets({
        dev: false,
        styles: ['new-york', 'base-nova'],
      })
    ).toEqual([
      {
        outputDir: 'public/r',
        registryBaseUrl: 'https://platejs.org/r',
        registryFile: 'public/r/registry.json',
        style: 'new-york',
      },
      {
        outputDir: 'public/r/new-york',
        registryBaseUrl: 'https://platejs.org/r/new-york',
        registryFile: 'public/r/new-york/registry.json',
        style: 'new-york',
      },
      {
        outputDir: 'public/r/base-nova',
        registryBaseUrl: 'https://platejs.org/r/base-nova',
        registryFile: 'public/r/base-nova/registry.json',
        style: 'base-nova',
      },
    ]);
  });

  it('keeps the legacy development registry alongside style variants', () => {
    expect(
      getRegistryBuildTargets({ dev: true, styles: ['new-york'] })
    ).toEqual([
      {
        outputDir: 'public/rd',
        registryBaseUrl: 'http://localhost:3000/rd',
        registryFile: 'public/rd/registry.json',
        style: 'new-york',
      },
      {
        outputDir: 'public/rd/new-york',
        registryBaseUrl: 'http://localhost:3000/rd/new-york',
        registryFile: 'public/rd/new-york/registry.json',
        style: 'new-york',
      },
    ]);
  });
});
