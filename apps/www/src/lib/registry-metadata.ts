import type { Registry } from 'shadcn/schema';

import registryMetadataData from '@/__registry__/registry-metadata.json';
import {
  PLATE_DEFAULT_REGISTRY_BASE,
  type PlateRegistryBase,
} from '@/lib/plate-registry-styles';

type RegistryMetadata = {
  generation: string;
  registries: Record<PlateRegistryBase, Registry>;
};

const registryMetadata = registryMetadataData as RegistryMetadata;

export const registryGeneration = registryMetadata.generation;

export function getRegistryMetadata(
  base: PlateRegistryBase = PLATE_DEFAULT_REGISTRY_BASE
) {
  return registryMetadata.registries[base];
}
