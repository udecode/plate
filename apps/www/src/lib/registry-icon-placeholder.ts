import type { RegistryPayload } from './registry-payload';

/** The icon libraries the shadcn CLI installs, as its IconPlaceholder props name them. */
export const ICON_PLACEHOLDER_LIBRARIES = [
  'lucide',
  'tabler',
  'hugeicons',
  'phosphor',
  'remixicon',
] as const;

export type IconLibrary = (typeof ICON_PLACEHOLDER_LIBRARIES)[number];

export const LUCIDE_PACKAGE = 'lucide-react';

export const PREVIEW_ICON_PACKAGES: Record<IconLibrary, string> = {
  hugeicons: '@hugeicons/core-free-icons',
  lucide: 'lucide-react-v1',
  phosphor: '@phosphor-icons/react',
  remixicon: '@remixicon/react',
  tabler: '@tabler/icons-react',
};

/** The element the shadcn CLI swaps for the project's icon. */
export const ICON_PLACEHOLDER_ELEMENT = 'IconPlaceholder';

/** The module the shadcn CLI removes the placeholder import from. */
export const ICON_PLACEHOLDER_MODULE = '@/components/icon-placeholder';

export const ICON_PLACEHOLDER_IMPORT = `import { ${ICON_PLACEHOLDER_ELEMENT} } from '${ICON_PLACEHOLDER_MODULE}';`;

const SOURCE_FILE_REGEX = /\.[cm]?[jt]sx?$/;
const PLACEHOLDER_ELEMENT_REGEX = new RegExp(
  `<${ICON_PLACEHOLDER_ELEMENT} ${ICON_PLACEHOLDER_LIBRARIES.map(
    (library) => `${library}="([^"]+)"`
  ).join(' ')}`,
  'g'
);

/**
 * The shadcn CLI transforms no `registry:file` or `registry:item` file, so
 * those keep Lucide.
 */
export function servesIconPlaceholders({
  path,
  type,
}: {
  path: string;
  type: string;
}) {
  return (
    SOURCE_FILE_REGEX.test(path) &&
    type !== 'registry:file' &&
    type !== 'registry:item'
  );
}

export function formatIconPlaceholder(names: Record<IconLibrary, string>) {
  return `${ICON_PLACEHOLDER_ELEMENT} ${ICON_PLACEHOLDER_LIBRARIES.map(
    (library) => `${library}="${names[library]}"`
  ).join(' ')}`;
}

function restoreLucideSource(source: string, filePath: string) {
  const names = new Set<string>();
  let restored = source.replaceAll(
    PLACEHOLDER_ELEMENT_REGEX,
    (_element, lucide: string) => {
      names.add(lucide);

      return `<${lucide}`;
    }
  );

  if (names.size > 0) {
    const [before, after, ...rest] = restored.split(ICON_PLACEHOLDER_IMPORT);

    if (after === undefined || rest.length > 0) {
      throw new Error(
        `${filePath}: expected one ${ICON_PLACEHOLDER_IMPORT} beside its placeholders.`
      );
    }

    restored = `${before}import { ${[...names].sort().join(', ')} } from '${LUCIDE_PACKAGE}';${after}`;
  }
  if (restored.includes(ICON_PLACEHOLDER_ELEMENT)) {
    throw new Error(
      `${filePath}: holds an ${ICON_PLACEHOLDER_ELEMENT} the registry build did not write.`
    );
  }

  return restored;
}

export function restoreLucideIcons(payload: RegistryPayload): RegistryPayload {
  let restoredLucide = false;
  const files = payload.files?.map((file) => {
    if (typeof file.content !== 'string' || !servesIconPlaceholders(file)) {
      return file;
    }

    const content = restoreLucideSource(file.content, file.path);

    if (content === file.content) return file;

    restoredLucide = true;

    return { ...file, content };
  });
  const dependencies = payload.dependencies ?? [];

  return {
    ...payload,
    ...(restoredLucide && !dependencies.includes(LUCIDE_PACKAGE)
      ? { dependencies: [...dependencies, LUCIDE_PACKAGE] }
      : {}),
    files,
    items: payload.items?.map(restoreLucideIcons),
  };
}
