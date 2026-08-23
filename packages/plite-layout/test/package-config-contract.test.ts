import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

type PackageJson = {
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
};

const readPackageJson = (): PackageJson =>
  JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
  ) as PackageJson;

describe('@platejs/plite-layout package config', () => {
  it('keeps React adapter peers optional for headless consumers', () => {
    const packageJson = readPackageJson();

    expect(packageJson.peerDependencies?.['@platejs/plite']).toBe(
      '>=54.0.0-beta.0'
    );
    expect(
      packageJson.peerDependenciesMeta?.['@platejs/plite']
    ).toBeUndefined();

    for (const dependency of ['@platejs/plite-react', 'react', 'react-dom']) {
      expect(packageJson.peerDependencies?.[dependency]).toBeDefined();
      expect(packageJson.peerDependenciesMeta?.[dependency]).toEqual({
        optional: true,
      });
    }
  });
});
