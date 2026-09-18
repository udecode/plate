const PLATE_PREFIX = '@plate/';
const SHADCN_PREFIX = '@shadcn/';

export type RegistryPayload = {
  files?: Array<Record<string, unknown>>;
  items?: RegistryPayload[];
  name?: string;
  registryDependencies?: string[];
  [key: string]: unknown;
};

function mapRegistryDependencies(
  payload: RegistryPayload,
  mapDependency: (dependency: string) => string
): RegistryPayload {
  return {
    ...payload,
    items: payload.items?.map((item) =>
      mapRegistryDependencies(item, mapDependency)
    ),
    registryDependencies: payload.registryDependencies?.map(mapDependency),
  };
}

export function normalizeRegistryPayload(
  payload: RegistryPayload,
  sourceBaseUrl: string
): RegistryPayload {
  const sourcePrefix = `${sourceBaseUrl.replace(/\/+$/, '')}/`;

  return mapRegistryDependencies(payload, (dependency) => {
    if (!dependency.startsWith(sourcePrefix) || !dependency.endsWith('.json')) {
      return dependency;
    }

    const name = dependency.slice(sourcePrefix.length, -'.json'.length);

    return name && !name.includes('/') ? `${PLATE_PREFIX}${name}` : dependency;
  });
}

export function serializeRegistryPayload(
  payload: RegistryPayload,
  targetBaseUrl: string
): RegistryPayload {
  const target = targetBaseUrl.replace(/\/+$/, '');

  return mapRegistryDependencies(payload, (dependency) => {
    if (dependency.startsWith(PLATE_PREFIX)) {
      return `${target}/${dependency.slice(PLATE_PREFIX.length)}.json`;
    }
    if (dependency.startsWith(SHADCN_PREFIX)) {
      return dependency.slice(SHADCN_PREFIX.length);
    }

    return dependency;
  });
}

function withoutFileContent(item: RegistryPayload): RegistryPayload {
  return {
    ...item,
    files: item.files?.map((file) => {
      const { content: _content, ...metadata } = file;

      return metadata;
    }),
  };
}

export function mergeRegistryOverlay(
  canonical: RegistryPayload,
  overlay: RegistryPayload,
  fileName: string
): RegistryPayload {
  if (fileName !== 'registry.json') return overlay;

  const overlayItems = new Map(
    overlay.items?.map((item) => [item.name, withoutFileContent(item)])
  );

  return {
    ...canonical,
    items: canonical.items?.map((item) => overlayItems.get(item.name) ?? item),
  };
}
