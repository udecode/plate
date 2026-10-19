const PLATE_REGISTRY_NAMESPACE = '@plate';
const SHADCN_REGISTRY_NAMESPACE = '@shadcn';
const PLATE_REGISTRY_NAMESPACE_PREFIX = `${PLATE_REGISTRY_NAMESPACE}/`;
const SHADCN_REGISTRY_NAMESPACE_PREFIX = `${SHADCN_REGISTRY_NAMESPACE}/`;
const TRAILING_SLASHES_REGEX = /\/+$/;

function isShadcnRegistryDependency(dependency: string) {
  return dependency.startsWith(SHADCN_REGISTRY_NAMESPACE_PREFIX);
}

function getPlateRegistryDependencyName(dependency: string) {
  if (!dependency.startsWith(PLATE_REGISTRY_NAMESPACE_PREFIX)) {
    return null;
  }

  return dependency.slice(PLATE_REGISTRY_NAMESPACE_PREFIX.length);
}

function normalizeRegistryBaseUrl(registryBaseUrl: string) {
  return registryBaseUrl.replace(TRAILING_SLASHES_REGEX, '');
}

export function toRegistryDependencySpecifier(dependency: string) {
  if (isShadcnRegistryDependency(dependency)) {
    return dependency.slice(SHADCN_REGISTRY_NAMESPACE_PREFIX.length);
  }

  return dependency;
}

export function toPublicRegistryDependencySpecifier(
  dependency: string,
  registryBaseUrl: string
) {
  const canonicalDependency = toRegistryDependencySpecifier(dependency);
  const plateItemName = getPlateRegistryDependencyName(canonicalDependency);

  if (!plateItemName) {
    return canonicalDependency;
  }

  return `${normalizeRegistryBaseUrl(registryBaseUrl)}/${plateItemName}.json`;
}

export function toPlateRegistryDependencySpecifier(dependency: string) {
  if (dependency.startsWith(PLATE_REGISTRY_NAMESPACE_PREFIX)) {
    return dependency;
  }

  return `${PLATE_REGISTRY_NAMESPACE_PREFIX}${dependency}`;
}
