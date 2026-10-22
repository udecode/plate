import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

describe('package scripts', () => {
  test('keeps Plate test metadata public-ready with optional environment peers', () => {
    const packageJsonPath = fileURLToPath(
      new URL('../../package.json', import.meta.url)
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      files: string[];
      license: string;
      name: string;
      peerDependencies?: Record<string, string>;
      peerDependenciesMeta?: Record<string, { optional?: boolean }>;
      private?: boolean;
      version: string;
    };

    expect(packageJson.name).toBe('@platejs/test');
    expect(packageJson.private).toBeUndefined();
    expect(packageJson.version).not.toContain('private');
    expect(packageJson.license).toBe('MIT');
    expect(packageJson.files).toEqual(['dist/**/*']);
    expect(packageJson.peerDependencies?.['@playwright/test']).toBe('>=1.52.0');
    expect(
      packageJson.peerDependenciesMeta?.['@playwright/test']?.optional
    ).toBe(true);
  });
});
