import { describe, expect, it } from 'bun:test';

import {
  createSparseRegistryIndexOverlay,
  mergeRegistryProviderOverlay,
  transformRegistryPayload,
} from './registry-style-materializer.mts';
import {
  getCommonRegistryStyleMarkers,
  loadRegistryStyleMaps,
} from './registry-style-transform.mts';

describe('registry style materializer', () => {
  it('transforms source files without touching non-source payloads', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);
    const payload = await transformRegistryPayload({
      commonMarkers,
      payload: {
        files: [
          {
            content: `const toggle = cva('cn-toggle');`,
            path: 'components/editor/toggle.tsx',
          },
          {
            content: 'cn-toggle',
            path: 'docs/toggle.md',
          },
        ],
        name: 'toggle',
      },
      styleMap: styleMaps.lyra,
    });

    expect(payload.files?.[0]?.content).toContain('rounded-none');
    expect(payload.files?.[0]?.content).not.toContain('cn-toggle');
    expect(payload.files?.[1]?.content).toBe('cn-toggle');
  });

  it('merges provider metadata and emits only changed index items', () => {
    const canonical = {
      items: [
        { dependencies: ['@base-ui/react'], name: 'toolbar' },
        { name: 'editor' },
      ],
      name: 'plate',
    };
    const provider = {
      items: [
        {
          dependencies: ['@radix-ui/react-toolbar'],
          name: 'toolbar',
        },
      ],
      name: 'plate',
    };
    const merged = mergeRegistryProviderOverlay(canonical, provider);
    const overlay = createSparseRegistryIndexOverlay(canonical, merged);

    expect(merged.items).toEqual([
      {
        dependencies: ['@radix-ui/react-toolbar'],
        name: 'toolbar',
      },
      { name: 'editor' },
    ]);
    expect(overlay?.items).toEqual([
      {
        dependencies: ['@radix-ui/react-toolbar'],
        name: 'toolbar',
      },
    ]);
  });
});
