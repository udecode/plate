import path from 'node:path';

import type { PlateRegistryBase } from '@/lib/plate-registry-styles';

export const REGISTRY_HOMEPAGE = 'https://platejs.org';

export type RegistryDirectory = 'r' | 'rd';

export interface RegistryBuildTarget {
  base: PlateRegistryBase;
  kind: 'canonical' | 'provider-overlay';
  outputDir: string;
  registryFile: string;
}

export const REGISTRY_PUBLIC_TARGETS: ReadonlyArray<{
  baseUrl: string;
  directory: RegistryDirectory;
}> = [
  { baseUrl: `${REGISTRY_HOMEPAGE}/r`, directory: 'r' },
  { baseUrl: 'http://localhost:3000/rd', directory: 'rd' },
];

export function getRegistryBuildTargets(
  stageDir: string
): [RegistryBuildTarget, RegistryBuildTarget] {
  return [
    {
      base: 'base',
      kind: 'canonical',
      outputDir: path.join(stageDir, 'raw/base'),
      registryFile: path.join(stageDir, 'input/base.registry.json'),
    },
    {
      base: 'radix',
      kind: 'provider-overlay',
      outputDir: path.join(stageDir, 'raw/radix'),
      registryFile: path.join(stageDir, 'input/radix.registry.json'),
    },
  ];
}

export function getRegistryStageTargets(stageDir: string) {
  return {
    canonicalDir: path.join(stageDir, 'neutral/canonical'),
    metadataFile: path.join(
      stageDir,
      'src/__registry__/registry-metadata.json'
    ),
    overlayDir: path.join(stageDir, 'src/__registry__/overlays'),
    previewIndexFile: path.join(stageDir, 'src/__registry__/index.tsx'),
    publicDirectories: Object.fromEntries(
      REGISTRY_PUBLIC_TARGETS.map(({ directory }) => [
        directory,
        path.join(stageDir, `public/${directory}`),
      ])
    ) as Record<RegistryDirectory, string>,
  };
}
