import { describe, expect, it } from 'bun:test';

import {
  getRegistryClipboardInstallCommand,
  getRegistryClipboardItemSpecifier,
  getRegistryInstallCommand,
  getRegistryItemSpecifier,
} from './registry-install';

describe('registry install commands', () => {
  const localRegistryUrl = 'http://localhost:3000/rd/';

  it('uses shadcn directory specifiers for bare Plate items', () => {
    expect(getRegistryItemSpecifier('editor-basic')).toBe(
      '@plate/editor-basic'
    );
    expect(getRegistryInstallCommand('editor-basic')).toBe(
      'npx shadcn@latest add @plate/editor-basic'
    );
  });

  it('uses local registry URLs for clipboard commands in development', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const env = process.env as Record<string, string | undefined>;

    env.NODE_ENV = 'development';

    try {
      expect(getRegistryClipboardItemSpecifier('editor-basic')).toBe(
        `${localRegistryUrl}editor-basic`
      );
      expect(getRegistryClipboardItemSpecifier('@plate/editor-basic')).toBe(
        `${localRegistryUrl}editor-basic`
      );
      expect(getRegistryClipboardInstallCommand('editor-basic')).toBe(
        `npx shadcn@latest add ${localRegistryUrl}editor-basic`
      );
    } finally {
      env.NODE_ENV = previousNodeEnv;
    }
  });

  it('preserves explicit registry specifiers', () => {
    expect(getRegistryItemSpecifier('@plate/editor-basic')).toBe(
      '@plate/editor-basic'
    );
    expect(getRegistryItemSpecifier('https://example.com/r/item')).toBe(
      'https://example.com/r/item'
    );
  });
});
