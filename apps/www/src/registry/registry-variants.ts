import type { PlateRegistryBase } from '@/lib/plate-registry-styles';

type EditorRegistryVariant = {
  itemName: string;
  packages: Record<PlateRegistryBase, string[]>;
};

const EDITOR_COMPONENT_TARGET_PREFIX = '@components/editor/';

export const EDITOR_REGISTRY_VARIANTS = new Map<string, EditorRegistryVariant>([
  [
    '@components/editor/context-menu.tsx',
    {
      itemName: 'editor-context-menu',
      packages: {
        base: ['@base-ui/react'],
        radix: [],
      },
    },
  ],
  [
    '@components/editor/dropdown-menu.tsx',
    {
      itemName: 'editor-dropdown-menu',
      packages: {
        base: ['@base-ui/react'],
        radix: [],
      },
    },
  ],
  [
    '@components/editor/toolbar.tsx',
    {
      itemName: 'toolbar',
      packages: {
        base: ['@base-ui/react'],
        radix: ['@radix-ui/react-toolbar', '@radix-ui/react-tooltip'],
      },
    },
  ],
  [
    '@components/editor/floating-popover.tsx',
    {
      itemName: 'floating-popover',
      packages: {
        base: ['@base-ui/react'],
        radix: ['@radix-ui/react-popover'],
      },
    },
  ],
]);

export function getEditorRegistryVariantFileName(target: string) {
  if (!target.startsWith(EDITOR_COMPONENT_TARGET_PREFIX)) {
    throw new Error(`Invalid editor registry variant target: ${target}`);
  }

  const fileName = target.slice(EDITOR_COMPONENT_TARGET_PREFIX.length);

  if (!fileName || fileName.includes('/')) {
    throw new Error(`Invalid editor registry variant file: ${target}`);
  }

  return fileName;
}

export function getEditorRegistryVariantSourcePath(
  target: string,
  base: PlateRegistryBase
) {
  return `bases/${base}/${getEditorRegistryVariantFileName(target)}`;
}

export const EDITOR_REGISTRY_VARIANT_PACKAGE_NAMES = new Set(
  [...EDITOR_REGISTRY_VARIANTS.values()].flatMap((variant) =>
    Object.values(variant.packages).flat()
  )
);

export const PLATE_REGISTRY_VARIANT_ITEM_NAMES = new Set(
  [...EDITOR_REGISTRY_VARIANTS.values()].map((variant) => variant.itemName)
);
