import { describe, expect, it } from 'bun:test';

import {
  toLocalRegistryDependency,
  toRegistryDependencySpecifier,
} from './registry-dependencies.mts';

describe('registry dependency specifiers', () => {
  it('uses the @plate namespace for Plate registry item names', () => {
    expect(toRegistryDependencySpecifier('toolbar')).toBe('@plate/toolbar');
    expect(toRegistryDependencySpecifier('editor-base-kit')).toBe(
      '@plate/editor-base-kit'
    );
  });

  it('preserves external registry and direct file specifiers', () => {
    expect(toRegistryDependencySpecifier('@shadcn/button')).toBe(
      '@shadcn/button'
    );
    expect(
      toRegistryDependencySpecifier('https://example.com/r/toolbar.json')
    ).toBe('https://example.com/r/toolbar.json');
    expect(toRegistryDependencySpecifier('./toolbar.json')).toBe(
      './toolbar.json'
    );
  });

  it('rewrites Plate namespace dependencies for local-file template sync', () => {
    expect(toLocalRegistryDependency('@plate/toolbar')).toBe('toolbar.json');
    expect(toLocalRegistryDependency('@shadcn/button')).toBe('@shadcn/button');
  });

  it('keeps local-file sync compatible with old localhost Plate URLs', () => {
    expect(
      toLocalRegistryDependency('http://localhost:3000/rd/toolbar.json')
    ).toBe('toolbar.json');
    expect(
      toLocalRegistryDependency('http://127.0.0.1:3000/rd/editor.json')
    ).toBe('editor.json');
  });
});
