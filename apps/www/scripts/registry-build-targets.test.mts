import { describe, expect, it } from 'bun:test';
import path from 'node:path';

import {
  getRegistryBuildTargets,
  getRegistryStageTargets,
  REGISTRY_PUBLIC_TARGETS,
} from './registry-build-targets.mts';

describe('registry build targets', () => {
  it('builds provider source once without an environment URL', () => {
    expect(getRegistryBuildTargets('/stage')).toEqual([
      {
        base: 'base',
        kind: 'canonical',
        outputDir: path.join('/stage', 'raw/base'),
        registryFile: path.join('/stage', 'input/base.registry.json'),
      },
      {
        base: 'radix',
        kind: 'provider-overlay',
        outputDir: path.join('/stage', 'raw/radix'),
        registryFile: path.join('/stage', 'input/radix.registry.json'),
      },
    ]);
  });

  it('publishes both public directories from one stage', () => {
    const targets = getRegistryStageTargets('/stage');

    expect(targets.publicDirectories).toEqual({
      r: path.join('/stage', 'public/r'),
      rd: path.join('/stage', 'public/rd'),
    });
    expect(REGISTRY_PUBLIC_TARGETS).toEqual([
      { baseUrl: 'https://platejs.org/r', directory: 'r' },
      { baseUrl: 'http://localhost:3000/rd', directory: 'rd' },
    ]);
  });
});
