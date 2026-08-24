import { describe, expect, it } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { resolveRegistrySourceFile } from './rehype-utils';

describe('resolveRegistrySourceFile', () => {
  it('resolves registry-prefixed paths from the app registry root', async () => {
    const appRoot = path.resolve(import.meta.dirname, '../..');
    const filePath = resolveRegistrySourceFile(
      appRoot,
      'src/registry/hooks/use-object-url.ts'
    );

    expect(filePath).toBe(
      path.join(appRoot, 'src/registry/hooks/use-object-url.ts')
    );
    expect(await fs.readFile(filePath, 'utf-8')).toContain(
      'export function useObjectUrl'
    );
  });

  it('rejects paths outside the registry root', () => {
    expect(() =>
      resolveRegistrySourceFile('/app', 'src/registry/../package.json')
    ).toThrow('Invalid registry file path');
  });
});
