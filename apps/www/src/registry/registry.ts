import type { Registry, RegistryItem } from 'shadcn/schema';

import { registryBlocks } from './registry-blocks';
import { registryComponents } from './registry-components';
import { registryExamples } from './registry-examples';
import { registryHooks } from './registry-hooks';
import { registryLib } from './registry-lib';
import { registryStyles } from './registry-styles';
import { registryEditor } from './registry-editor';

const url =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://platejs.org';

const EDITOR_COMPONENT_PATH_SEGMENT = 'components/editor/';
const EDITOR_COMPONENT_TARGET_PREFIX = '@components/editor/';

export const PLATE_REGISTRY_BASES = ['radix', 'base', 'aria'] as const;

export type PlateRegistryBase = (typeof PLATE_REGISTRY_BASES)[number];

const EDITOR_BASE_VARIANT_FILES = new Map([
  ['components/editor/toolbar.tsx', 'toolbar.tsx'],
]);
const EDITOR_BASE_PACKAGES: Record<PlateRegistryBase, string[]> = {
  aria: ['react-aria-components'],
  base: ['@base-ui/react'],
  radix: ['@radix-ui/react-toolbar', '@radix-ui/react-tooltip'],
};

function getEditorComponentTarget(filePath: string) {
  const segmentIndex = filePath.indexOf(EDITOR_COMPONENT_PATH_SEGMENT);

  if (segmentIndex === -1) return null;

  return `${EDITOR_COMPONENT_TARGET_PREFIX}${filePath.slice(segmentIndex + EDITOR_COMPONENT_PATH_SEGMENT.length)}`;
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
    let hasVariantFile = false;
    const files = item.files?.map((file) => {
      const fileName = EDITOR_BASE_VARIANT_FILES.get(file.path);

      if (!fileName) return file;
      hasVariantFile = true;

      if (base === 'radix') return file;

      return {
        ...file,
        path: `bases/${base}/editor/${fileName}`,
        target: `${EDITOR_COMPONENT_TARGET_PREFIX}${fileName}`,
      };
    });

    if (!hasVariantFile) return { ...item, files };

    return {
      ...item,
      dependencies: [
        ...(item.dependencies ?? []).filter(
          (dependency) =>
            !Object.values(EDITOR_BASE_PACKAGES).flat().includes(dependency)
        ),
        ...EDITOR_BASE_PACKAGES[base],
      ],
      files,
    };
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
  base = 'radix',
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
  homepage = url,
  options?: { base?: PlateRegistryBase }
): Registry {
  return {
    homepage,
    items: createPlateRegistryItems(options),
    name: 'plate',
  };
}

export const registry = createPlateRegistry();
