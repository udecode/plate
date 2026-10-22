import { describe, expect, it } from 'bun:test';
import path from 'node:path';

import { getRegistryItem, resolveRegistrySourceFile } from './rehype-utils';

describe('resolveRegistrySourceFile', () => {
  it('resolves registry-prefixed paths from the app registry root', async () => {
    const cwd = process.cwd();
    process.chdir(path.resolve(import.meta.dirname, '../..'));

    try {
      const item = await getRegistryItem('use-object-url');

      expect(item?.files?.[0]?.content).toContain(
        'export function useObjectUrl'
      );
    } finally {
      process.chdir(cwd);
    }
  });

  it('rejects paths outside the registry root', () => {
    expect(() =>
      resolveRegistrySourceFile('/app', 'src/registry/../package.json')
    ).toThrow('Invalid registry file path');
  });
});
