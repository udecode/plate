import type { Registry, RegistryItem } from 'shadcn/schema';

import {
  PLATE_DEFAULT_REGISTRY_BASE,
  type PlateRegistryBase,
  PLATE_REGISTRY_BASES,
} from '@/lib/plate-registry-styles';

import { registryBlocks } from './registry-blocks';
import { registryComponents } from './registry-components';
import { registryEditor } from './registry-editor';
import { registryExamples } from './registry-examples';
import { registryHooks } from './registry-hooks';
import { registryLib } from './registry-lib';
import { registryStyles } from './registry-styles';
import {
  EDITOR_REGISTRY_VARIANTS,
  getEditorRegistryVariantSourcePath,
} from './registry-variants';

const REGISTRY_HOMEPAGE = 'https://platejs.org';
const EDITOR_COMPONENT_PATH_SEGMENT = 'components/editor/';
const EDITOR_COMPONENT_TARGET_PREFIX = '@components/editor/';

export { PLATE_DEFAULT_REGISTRY_BASE, PLATE_REGISTRY_BASES };
export type { PlateRegistryBase };

function getEditorComponentTarget(filePath: string) {
  const segmentIndex = filePath.indexOf(EDITOR_COMPONENT_PATH_SEGMENT);

  if (segmentIndex === -1) return null;

  return `${EDITOR_COMPONENT_TARGET_PREFIX}${filePath.slice(
    segmentIndex + EDITOR_COMPONENT_PATH_SEGMENT.length
  )}`;
}

function withEditorComponentTargets(
  items: Registry['items']
): Registry['items'] {
  return items.map((item) => ({
    ...item,
    files: item.files?.map((file) => {
      const target = getEditorComponentTarget(file.path);

      if (file.target || !target) {
        return file;
      }

      return {
        ...file,
        target,
      };
    }),
  }));
}

function withEditorBase(
  items: Registry['items'],
  base: PlateRegistryBase
): Registry['items'] {
  return items.map((item) => {
    const files = item.files?.map((file) => {
      const { target } = file;

      if (!target) return file;

      const variant = EDITOR_REGISTRY_VARIANTS.get(target);

      if (!variant) return file;

      return {
        ...file,
        path: getEditorRegistryVariantSourcePath(target, base),
      };
    });

    return { ...item, files };
  });
}

export const registryInit: RegistryItem[] = [
  {
    dependencies: ['platejs'],
    description: 'Install Plate package',
    devDependencies: [],
    files: [],
    name: 'plate',
    registryDependencies: [],
    type: 'registry:lib',
  },
  {
    cssVars: {
      dark: {
        brand: 'oklch(0.707 0.165 254.624)',
      },
      light: {
        brand: 'oklch(0.623 0.214 259.815)',
      },
    },
    description: 'Install Plate package and styles',
    devDependencies: [],
    files: [],
    name: 'plate-ui',
    registryDependencies: ['@plate/plate'],
    type: 'registry:style',
  },
];

export function createPlateRegistryItems({
  base = PLATE_DEFAULT_REGISTRY_BASE,
}: {
  base?: PlateRegistryBase;
} = {}): Registry['items'] {
  const registryBlockItems = registryBlocks.map((block) => ({
    ...block,
    registryDependencies: [
      '@plate/plate-ui',
      ...(block.registryDependencies ?? []),
    ],
  }));

  return withEditorBase(
    withEditorComponentTargets([
      ...registryInit,
      ...registryEditor,
      ...registryComponents,
      ...registryBlockItems,
      ...registryLib,
      ...registryStyles,
      ...registryHooks,
      ...registryExamples,
    ]),
    base
  );
}

export function createPlateRegistry(
  homepage = REGISTRY_HOMEPAGE,
  options?: { base?: PlateRegistryBase }
): Registry {
  return {
    homepage,
    items: createPlateRegistryItems(options),
    name: 'plate',
  };
}
