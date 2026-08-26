import type { PlateRegistryBase } from '@/lib/plate-registry-styles';

export const REGISTRY_HOMEPAGE = 'https://platejs.org';

export interface RegistryBuildTarget {
  base: PlateRegistryBase;
  kind: 'canonical' | 'provider-overlay';
  outputDir: string;
  registryBaseUrl: string;
  registryFile: string;
}

export interface RegistryOutputTarget {
  canonicalDir: string;
  overlayDir: string;
  registryBaseUrl: string;
}

export function getRegistryBuildTargets({
  dev,
}: {
  dev: boolean;
}): [RegistryBuildTarget, RegistryBuildTarget] {
  const registryRootUrl = dev
    ? 'http://localhost:3000/rd'
    : `${REGISTRY_HOMEPAGE}/r`;

  return [
    {
      base: 'base',
      kind: 'canonical',
      outputDir: '.registry-build/base',
      registryBaseUrl: registryRootUrl,
      registryFile: '.registry-build/base.registry.json',
    },
    {
      base: 'radix',
      kind: 'provider-overlay',
      outputDir: '.registry-build/radix',
      registryBaseUrl: registryRootUrl,
      registryFile: '.registry-build/radix.registry.json',
    },
  ];
}

export function getRegistryOutputTarget({
  dev,
}: {
  dev: boolean;
}): RegistryOutputTarget {
  return {
    canonicalDir: dev ? 'public/rd' : 'public/r',
    overlayDir: 'src/__registry__/overlays',
    registryBaseUrl: dev
      ? 'http://localhost:3000/rd'
      : `${REGISTRY_HOMEPAGE}/r`,
  };
}
