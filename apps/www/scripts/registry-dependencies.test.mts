import { describe, expect, it } from 'bun:test';

import {
  toLocalRegistryDependency,
  toPlateRegistryDependencySpecifier,
  toPublicRegistryDependencySpecifier,
  toRegistryDependencySpecifier,
} from './registry-dependencies.mts';

describe('registry dependency specifiers', () => {
  it('uses explicit Plate namespace specifiers for Plate registry item names', () => {
    expect(toPlateRegistryDependencySpecifier('toolbar')).toBe(
      '@plate/toolbar'
    );
    expect(toPlateRegistryDependencySpecifier('editor-base-kit')).toBe(
      '@plate/editor-base-kit'
    );
    expect(toPlateRegistryDependencySpecifier('@plate/toolbar')).toBe(
      '@plate/toolbar'
    );
  });

  it('uses bare names for upstream shadcn registry items', () => {
    expect(toRegistryDependencySpecifier('button')).toBe('button');
    expect(toRegistryDependencySpecifier('@shadcn/button')).toBe('button');
  });

  it('uses same-base URLs for public Plate self-dependencies', () => {
    expect(
      toPublicRegistryDependencySpecifier(
        '@plate/toolbar',
        'https://platejs.org/r'
      )
    ).toBe('https://platejs.org/r/toolbar.json');
    expect(
      toPublicRegistryDependencySpecifier(
        '@plate/editor-base-kit',
        'http://localhost:3000/rd/'
      )
    ).toBe('http://localhost:3000/rd/editor-base-kit.json');
  });

  it('keeps public shadcn dependencies bare', () => {
    expect(
      toPublicRegistryDependencySpecifier('@shadcn/command', 'https://x.test/r')
    ).toBe('command');
    expect(
      toPublicRegistryDependencySpecifier('button', 'https://x.test/r')
    ).toBe('button');
  });

  it('preserves external registry and direct file specifiers', () => {
    expect(toRegistryDependencySpecifier('@plate/toolbar')).toBe(
      '@plate/toolbar'
    );
    expect(
      toRegistryDependencySpecifier('https://example.com/r/toolbar.json')
    ).toBe('https://example.com/r/toolbar.json');
    expect(toRegistryDependencySpecifier('./toolbar.json')).toBe(
      './toolbar.json'
    );
    expect(
      toPublicRegistryDependencySpecifier(
        'https://example.com/r/toolbar.json',
        'https://platejs.org/r'
      )
    ).toBe('https://example.com/r/toolbar.json');
  });

  it('rewrites Plate namespace dependencies for local-file template sync', () => {
    expect(toLocalRegistryDependency('@plate/toolbar')).toBe('toolbar.json');
    expect(toLocalRegistryDependency('@shadcn/button')).toBe('button');
    expect(toLocalRegistryDependency('button')).toBe('button');
  });

  it('keeps local-file sync compatible with old localhost Plate URLs', () => {
    expect(
      toLocalRegistryDependency('http://localhost:3000/rd/toolbar.json')
    ).toBe('toolbar.json');
    expect(
      toLocalRegistryDependency('http://127.0.0.1:3000/rd/editor.json')
    ).toBe('editor.json');
    expect(toLocalRegistryDependency('https://platejs.org/r/editor.json')).toBe(
      'editor.json'
    );
  });
});
