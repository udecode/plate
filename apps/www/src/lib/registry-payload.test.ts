import { describe, expect, it } from 'bun:test';

import {
  mergeRegistryOverlay,
  normalizeRegistryPayload,
  serializeRegistryPayload,
} from './registry-payload';

describe('registry payload dependencies', () => {
  it('normalizes only exact registry-owned URLs', () => {
    const payload = normalizeRegistryPayload(
      {
        registryDependencies: [
          'https://platejs.org/r/editor.json',
          'https://platejs.org/r/nested/editor.json',
          'https://example.com/r/editor.json',
        ],
      },
      'https://platejs.org/r'
    );

    expect(payload.registryDependencies).toEqual([
      '@plate/editor',
      'https://platejs.org/r/nested/editor.json',
      'https://example.com/r/editor.json',
    ]);
  });

  it('serializes Plate and shadcn identities recursively', () => {
    const payload = serializeRegistryPayload(
      {
        items: [{ registryDependencies: ['@plate/editor', '@shadcn/button'] }],
        registryDependencies: ['@plate/plate-ui'],
      },
      'http://localhost:3000/rd/base-luma'
    );

    expect(payload).toMatchObject({
      items: [
        {
          registryDependencies: [
            'http://localhost:3000/rd/base-luma/editor.json',
            'button',
          ],
        },
      ],
      registryDependencies: [
        'http://localhost:3000/rd/base-luma/plate-ui.json',
      ],
    });
  });

  it('merges sparse index metadata without replacing canonical file content', () => {
    const payload = mergeRegistryOverlay(
      {
        items: [
          {
            dependencies: ['@base-ui/react'],
            files: [{ content: 'canonical', path: 'toolbar.tsx' }],
            name: 'toolbar',
          },
        ],
      },
      {
        items: [
          {
            dependencies: ['@radix-ui/react-toolbar'],
            files: [{ content: 'overlay', path: 'toolbar.tsx' }],
            name: 'toolbar',
          },
        ],
      },
      'registry.json'
    );

    expect(payload.items).toEqual([
      {
        dependencies: ['@radix-ui/react-toolbar'],
        files: [{ path: 'toolbar.tsx' }],
        name: 'toolbar',
      },
    ]);
  });
});
