import { describe, expect, it } from 'bun:test';

import type { Registry, RegistryItem } from 'shadcn/schema';

import {
  createRegistryIndexSource,
  getRegistryIndexComponentPath,
} from './registry-index.mts';

function createItem(
  name: string,
  type: RegistryItem['type'],
  meta?: RegistryItem['meta']
): RegistryItem {
  return {
    files: [{ path: `${name}.tsx`, type }],
    meta,
    name,
    type,
  } as RegistryItem;
}

describe('registry index', () => {
  it('creates loaders only for rendered examples and blocks', () => {
    expect(
      getRegistryIndexComponentPath(
        createItem('toolbar-demo', 'registry:example')
      )
    ).toBe('@/registry/toolbar-demo.tsx');
    expect(
      getRegistryIndexComponentPath(createItem('editor', 'registry:block'))
    ).toBe('@/registry/editor.tsx');
    expect(
      getRegistryIndexComponentPath(createItem('toolbar', 'registry:ui'))
    ).toBeNull();
    expect(
      getRegistryIndexComponentPath(
        createItem('server-block', 'registry:block', { rsc: true })
      )
    ).toBeNull();
  });

  it('keeps metadata entries without importing metadata-only components', () => {
    const toolbar = createItem('toolbar', 'registry:ui');
    toolbar.dependencies = ['platejs'];
    const source = createRegistryIndexSource(
      {
        items: [
          createItem('toolbar-demo', 'registry:example'),
          createItem('editor', 'registry:block'),
          toolbar,
          createItem('upload', 'registry:file'),
        ],
      } as Registry,
      'generation-id'
    );

    expect(source).toContain('registryGeneration = "generation-id"');
    expect(source).toContain('"toolbar": {');
    expect(source).toContain('dependencies: ["platejs"]');
    expect(source).toContain('"upload": {');
    expect(source).toContain('import("@/registry/toolbar-demo.tsx")');
    expect(source).toContain('import("@/registry/editor.tsx")');
    expect(source).not.toContain('import("@/registry/toolbar.tsx")');
    expect(source).not.toContain('import("@/registry/upload.tsx")');
    expect(source.match(/React\.lazy/g)).toHaveLength(2);
  });
});
