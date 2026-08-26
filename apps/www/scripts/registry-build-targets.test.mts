import { describe, expect, it } from 'bun:test';

import { PRESET_BASES, PRESET_STYLES } from 'shadcn/preset';

import {
  getPlateRegistryStyleBase,
  getPlateRegistryStyle,
  PLATE_DEFAULT_REGISTRY_BASE,
  PLATE_DEFAULT_REGISTRY_STYLE,
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLES,
} from '@/lib/plate-registry-styles';

import {
  getRegistryBuildTargets,
  getRegistryOutputTarget,
} from './registry-build-targets.mts';

describe('registry build targets', () => {
  it('supports an explicit subset of upstream bases', () => {
    expect(PLATE_REGISTRY_BASES).toEqual(['base', 'radix']);
    expect(PLATE_DEFAULT_REGISTRY_BASE).toBe('base');
    expect(PLATE_DEFAULT_REGISTRY_STYLE).toBe('base-nova');
    expect(
      PLATE_REGISTRY_BASES.every((base) => PRESET_BASES.includes(base))
    ).toBe(true);
    expect(PLATE_REGISTRY_STYLES).toHaveLength(
      2 + PLATE_REGISTRY_BASES.length * PRESET_STYLES.length
    );
    expect(
      PLATE_REGISTRY_STYLES.some((style) => style.startsWith('aria-'))
    ).toBe(false);
  });

  it('maps supported public styles and rejects unsupported styles', () => {
    expect(getPlateRegistryStyleBase('new-york')).toBe('radix');
    expect(getPlateRegistryStyleBase('new-york-v4')).toBe('radix');
    expect(getPlateRegistryStyleBase('radix-luma')).toBe('radix');
    expect(getPlateRegistryStyleBase('base-luma')).toBe('base');
    expect(getPlateRegistryStyleBase('aria-luma')).toBeNull();
    expect(getPlateRegistryStyleBase('unknown')).toBeNull();
    expect(getPlateRegistryStyle('new-york')).toEqual({
      base: 'radix',
      style: 'nova',
    });
    expect(getPlateRegistryStyle('new-york-v4')).toEqual({
      base: 'radix',
      style: 'nova',
    });
    expect(getPlateRegistryStyle('base-luma')).toEqual({
      base: 'base',
      style: 'luma',
    });
    expect(getPlateRegistryStyle('aria-luma')).toBeNull();
  });

  it('builds one full Base graph and one provider-only Radix graph', () => {
    expect(getRegistryBuildTargets({ dev: false })).toEqual([
      {
        base: 'base',
        kind: 'canonical',
        outputDir: '.registry-build/base',
        registryBaseUrl: 'https://platejs.org/r',
        registryFile: '.registry-build/base.registry.json',
      },
      {
        base: 'radix',
        kind: 'provider-overlay',
        outputDir: '.registry-build/radix',
        registryBaseUrl: 'https://platejs.org/r',
        registryFile: '.registry-build/radix.registry.json',
      },
    ]);
    expect(getRegistryOutputTarget({ dev: false })).toEqual({
      canonicalDir: 'public/r',
      overlayDir: 'src/__registry__/overlays',
      registryBaseUrl: 'https://platejs.org/r',
    });
  });

  it('keeps the same build owners in development', () => {
    expect(getRegistryBuildTargets({ dev: true })).toEqual([
      {
        base: 'base',
        kind: 'canonical',
        outputDir: '.registry-build/base',
        registryBaseUrl: 'http://localhost:3000/rd',
        registryFile: '.registry-build/base.registry.json',
      },
      {
        base: 'radix',
        kind: 'provider-overlay',
        outputDir: '.registry-build/radix',
        registryBaseUrl: 'http://localhost:3000/rd',
        registryFile: '.registry-build/radix.registry.json',
      },
    ]);
    expect(getRegistryOutputTarget({ dev: true })).toEqual({
      canonicalDir: 'public/rd',
      overlayDir: 'src/__registry__/overlays',
      registryBaseUrl: 'http://localhost:3000/rd',
    });
  });
});
