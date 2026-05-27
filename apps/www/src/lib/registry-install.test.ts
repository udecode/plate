import { describe, expect, it } from 'bun:test';

import { siteConfig } from '@/config/site';

import {
  getRegistryInstallCommand,
  getRegistryItemSpecifier,
} from './registry-install';

describe('registry install commands', () => {
  it('uses standalone registry URLs for bare Plate items', () => {
    expect(getRegistryItemSpecifier('editor-basic')).toBe(
      `${siteConfig.registryUrl}editor-basic`
    );
    expect(getRegistryInstallCommand('editor-basic')).toBe(
      `npx shadcn@latest add ${siteConfig.registryUrl}editor-basic`
    );
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
