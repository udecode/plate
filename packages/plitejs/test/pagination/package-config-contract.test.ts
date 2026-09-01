import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

type PackageJson = {
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

const readPackageJson = (): PackageJson =>
  JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
  ) as PackageJson;

describe('plitejs package config', () => {
  it('keeps React peers optional for headless consumers', () => {
    const packageJson = readPackageJson();

    for (const dependency of ['react', 'react-dom']) {
      expect(packageJson.peerDependencies?.[dependency]).toBeDefined();
      expect(packageJson.peerDependenciesMeta?.[dependency]).toEqual({
        optional: true,
      });
    }
  });
});
